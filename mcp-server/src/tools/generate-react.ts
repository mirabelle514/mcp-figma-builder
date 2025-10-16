import { z } from 'zod';
import { FigmaService } from '../services/figma-service.js';
import { FigmaExtractor } from '../services/figma-extractor.js';
import { ReactGenerator } from '../services/react-generator.js';
import { DatabaseService } from '../services/db-service.js';

const GenerateReactInputSchema = z.object({
  figmaUrl: z.string().describe('Full Figma URL with optional node-id parameter'),
  componentName: z.string().optional().describe('Custom component name (optional, will be derived from Figma if not provided)'),
  includeTypeScript: z.boolean().optional().describe('Generate TypeScript code (default: true)'),
  includeComments: z.boolean().optional().describe('Include code comments (default: false)'),
});

export const generateReactTool = {
  name: 'generate_react_from_figma',
  description: 'Generate a complete React component from a Figma design URL. This tool analyzes the Figma design, extracts all layout and styling information, and uses AI to generate production-ready React code using your actual component library (e.g., EUI components).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      figmaUrl: {
        type: 'string',
        description: 'Full Figma URL (e.g., https://www.figma.com/design/ABC123/Design?node-id=4-38)',
      },
      componentName: {
        type: 'string',
        description: 'Custom component name (optional)',
      },
      includeTypeScript: {
        type: 'boolean',
        description: 'Generate TypeScript code (default: true)',
      },
      includeComments: {
        type: 'boolean',
        description: 'Include code comments (default: false)',
      },
    },
    required: ['figmaUrl'],
  },
};

export async function handleGenerateReact(
  args: z.infer<typeof GenerateReactInputSchema>,
  env: {
    FIGMA_ACCESS_TOKEN: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    ANTHROPIC_API_KEY?: string;
  }
) {
  const startTime = Date.now();

  try {
    if (!env.ANTHROPIC_API_KEY) {
      return {
        content: [
          {
            type: 'text' as const,
            text: 'Error: ANTHROPIC_API_KEY environment variable is required for React code generation. Please add it to your MCP server configuration.',
          },
        ],
        isError: true,
      };
    }

    const figmaService = new FigmaService(env.FIGMA_ACCESS_TOKEN);
    const { fileKey, nodeId } = figmaService.parseFigmaUrl(args.figmaUrl);

    let figmaNode;
    if (nodeId) {
      figmaNode = await figmaService.getNode(fileKey, nodeId);
    } else {
      const file = await figmaService.getFile(fileKey);
      figmaNode = file.document;
    }

    const db = new DatabaseService(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

    const designId = await db.storeFigmaDesign({
      figma_url: args.figmaUrl,
      file_key: fileKey,
      node_id: nodeId,
      design_name: figmaNode.name,
      raw_data: figmaNode,
    });

    const extractor = new FigmaExtractor();
    const designData = extractor.extractDesignData(figmaNode as any);

    const generator = new ReactGenerator(env.ANTHROPIC_API_KEY, db);
    const generatedComponent = await generator.generateComponent(designData, {
      componentName: args.componentName,
      includeTypeScript: args.includeTypeScript ?? true,
      includeComments: args.includeComments ?? false,
    });

    const componentId = await db.storeGeneratedComponent({
      figma_design_id: designId,
      component_name: generatedComponent.componentName,
      component_code: generatedComponent.componentCode,
      props_interface: generatedComponent.propsInterface,
      imports: generatedComponent.imports,
      dependencies: generatedComponent.dependencies,
      ai_model: generatedComponent.metadata.aiModel,
      generation_prompt: generatedComponent.metadata.generationPrompt,
      metadata: {
        designTokens: designData.designTokens,
        complexity: designData.metadata.complexity,
      },
    });

    const generationTime = Date.now() - startTime;

    await db.storeGenerationHistory({
      figma_design_id: designId,
      generated_component_id: componentId,
      success: true,
      generation_time_ms: generationTime,
    });

    const output = formatOutput(generatedComponent, designData, generationTime);

    return {
      content: [
        {
          type: 'text' as const,
          text: output,
        },
      ],
    };
  } catch (error) {
    const generationTime = Date.now() - startTime;

    return {
      content: [
        {
          type: 'text' as const,
          text: `Error generating React component: ${error instanceof Error ? error.message : String(error)}\n\nGeneration time: ${generationTime}ms`,
        },
      ],
      isError: true,
    };
  }
}

function formatOutput(
  component: any,
  designData: any,
  generationTime: number
): string {
  return `# Generated React Component

## Component: ${component.componentName}

### Generation Summary
- **Time:** ${generationTime}ms
- **Complexity:** ${designData.metadata.complexity}
- **Total Elements:** ${designData.metadata.totalComponents}
- **Interactive Elements:** ${designData.metadata.hasInteractiveElements ? 'Yes' : 'No'}
- **Has Images:** ${designData.metadata.hasImages ? 'Yes' : 'No'}
- **AI Model:** ${component.metadata.aiModel}

### Design Tokens Extracted
**Colors:** ${Object.keys(designData.designTokens.colors).length} unique colors
**Spacing:** ${designData.designTokens.spacing.length} values
**Font Sizes:** ${designData.designTokens.fontSizes.length} values
**Border Radii:** ${designData.designTokens.borderRadii.length} values

### Dependencies Required
\`\`\`json
${JSON.stringify(component.dependencies, null, 2)}
\`\`\`

### Generated Code

\`\`\`tsx
${component.componentCode}
\`\`\`

### Usage Example

\`\`\`tsx
import { ${component.componentName} } from './${component.componentName}';

function App() {
  return (
    <div>
      <${component.componentName} />
    </div>
  );
}
\`\`\`

### Next Steps
1. Copy the generated code to your project
2. Install dependencies: \`npm install ${component.dependencies.join(' ')}\`
3. Ensure your component library is installed and configured
4. Review and customize the component as needed
5. Test the component in your application

### Notes
- The component uses your actual component library (e.g., EUI, MUI, etc.)
- Components are mapped from Figma elements to design system equivalents
- All spacing and colors are extracted from your Figma design
- Interactive elements may need additional logic for state management
- Images will need actual image sources
- Review accessibility attributes and enhance as needed

**Component saved to database with ID:** ${component.componentName}
`;
}
