import { z } from 'zod';
import { FigmaService } from '../services/figma-service.js';
import { FigmaMatcher } from '../services/figma-matcher.js';
import { DatabaseService } from '../services/db-service.js';

const AnalyzeFigmaInputSchema = z.object({
  figmaUrl: z.string().describe('Full Figma URL with optional node-id parameter'),
});

export const analyzeFigmaTool = {
  name: 'analyze_figma_design',
  description: 'Analyze a Figma design and match it to existing design system components. Returns matched components with confidence scores and suggested props.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      figmaUrl: {
        type: 'string',
        description: 'Full Figma URL (e.g., https://www.figma.com/design/ABC123/Design?node-id=4-38)',
      },
    },
    required: ['figmaUrl'],
  },
};

export async function handleAnalyzeFigma(
  args: z.infer<typeof AnalyzeFigmaInputSchema>,
  env: { FIGMA_ACCESS_TOKEN: string; SUPABASE_URL: string; SUPABASE_ANON_KEY: string }
) {
  try {
    const figmaService = new FigmaService(env.FIGMA_ACCESS_TOKEN);
    const { fileKey, nodeId } = figmaService.parseFigmaUrl(args.figmaUrl);

    const db = new DatabaseService(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const components = await db.getComponents();

    if (components.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No components found in database. Please run the 'scan_repository' tool first to load the component library.`,
          },
        ],
      };
    }

    let figmaNode;
    if (nodeId) {
      figmaNode = await figmaService.getNode(fileKey, nodeId);
    } else {
      const file = await figmaService.getFile(fileKey);
      figmaNode = file.document;
    }

    const matcher = new FigmaMatcher();
    await matcher.loadComponentMappings(components as any);
    const matches = await matcher.matchDesign(figmaNode);

    if (matches.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No matching components found for this Figma design.

Tips to improve matching:
- Use descriptive names in Figma (e.g., "Hero Section", "Primary Button")
- Ensure the design uses patterns that match your component library
- Check that components were scanned successfully`,
          },
        ],
      };
    }

    const highConfidenceMatches = matches.filter(m => m.confidence > 0.5);
    const matchList = highConfidenceMatches.slice(0, 10).map(m => {
      const confidencePercent = Math.round(m.confidence * 100);
      const patterns = m.matched_patterns.join(', ');
      return `
### ${m.component_name} (${confidencePercent}% match)
- **Import**: \`${m.component_path}\`
- **Figma node**: "${m.figma_node_name}"
- **Matched patterns**: ${patterns}
- **Suggested props**: ${JSON.stringify(m.suggested_props, null, 2)}
`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `# Figma Design Analysis

Found ${highConfidenceMatches.length} high-confidence matches:

${matchList}

Use the 'generate_implementation_guide' tool to get complete implementation code.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error analyzing Figma design: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
