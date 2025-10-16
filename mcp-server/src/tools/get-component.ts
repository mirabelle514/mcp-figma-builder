import { z } from 'zod';
import { DatabaseService } from '../services/db-service.js';

const GetComponentInputSchema = z.object({
  componentName: z.string().describe('Name of the EUI component to get details for'),
});

export const getComponentTool = {
  name: 'get_component_details',
  description: 'Get detailed information about a specific EUI Design System component including props, variants, and usage examples.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      componentName: {
        type: 'string',
        description: 'Name of the component (e.g., "Button", "Hero", "Card")',
      },
    },
    required: ['componentName'],
  },
};

export async function handleGetComponent(
  args: z.infer<typeof GetComponentInputSchema>,
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string }
) {
  try {
    const db = new DatabaseService(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    const component = await db.getEuiComponent(args.componentName);

    if (!component) {
      const allComponents = await db.getEuiComponents();
      const componentList = allComponents.map(c => `  - ${c.component_name}`).join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `Component '${args.componentName}' not found.

Available components:
${componentList}

Tip: Component names are case-sensitive.`,
          },
        ],
      };
    }

    const propsText = Object.entries(component.props)
      .map(([name, info]: [string, any]) => {
        const required = info.required ? '(required)' : '(optional)';
        return `  - **${name}** ${required}: \`${info.type}\``;
      })
      .join('\n');

    const variantsText = Object.entries(component.variants)
      .map(([name, values]) => `  - **${name}**: ${values.join(', ')}`)
      .join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `# ${component.component_name}

${component.description || 'No description available'}

## Import

\`\`\`tsx
import { ${component.component_name} } from '${component.component_path}';
\`\`\`

## Props

${propsText || 'No props documented'}

## Variants

${variantsText || 'No variants available'}

## Visual Patterns

${component.visual_patterns.join(', ')}

## Usage Example

\`\`\`tsx
${component.usage_example}
\`\`\`

## Repository

${component.repo_url || 'No repository link available'}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error getting component details: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
