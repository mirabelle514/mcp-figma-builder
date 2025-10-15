import { z } from 'zod';
import { FigmaService } from '../services/figma-service.js';
import { FigmaMatcher } from '../services/figma-matcher.js';
import { ImplementationGenerator } from '../services/implementation-generator.js';
import { DatabaseService } from '../services/db-service.js';

const GenerateGuideInputSchema = z.object({
  figmaUrl: z.string().describe('Full Figma URL with optional node-id parameter'),
});

export const generateGuideTool = {
  name: 'generate_implementation_guide',
  description: 'Generate a complete implementation guide with code examples for implementing a Figma design using Lumiere Design System components.',
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

export async function handleGenerateGuide(
  args: z.infer<typeof GenerateGuideInputSchema>,
  env: { FIGMA_ACCESS_TOKEN: string; SUPABASE_URL: string; SUPABASE_ANON_KEY: string }
) {
  try {
    const figmaService = new FigmaService(env.FIGMA_ACCESS_TOKEN);
    const { fileKey, nodeId } = figmaService.parseFigmaUrl(args.figmaUrl);

    const db = new DatabaseService(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const components = await db.getLumiereComponents();

    if (components.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No Lumiere components found in database. Please run the 'scan_lumiere_repository' tool first.`,
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
            text: `No matching components found for this Figma design. Try using more descriptive names in your Figma file.`,
          },
        ],
      };
    }

    const generator = new ImplementationGenerator();
    const guide = generator.generateGuide(matches, figmaNode);
    const markdown = generator.formatAsMarkdown(guide);

    await db.storeImplementationGuide({
      figma_url: args.figmaUrl,
      figma_node_id: nodeId,
      detected_components: matches.map(m => ({
        name: m.component_name,
        confidence: m.confidence,
      })),
      implementation_code: guide.full_code,
      customization_notes: guide.customization_notes.join('\n'),
      metadata: {
        design_tokens: guide.design_tokens,
      },
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: markdown,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error generating implementation guide: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
