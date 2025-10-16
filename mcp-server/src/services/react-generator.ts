// Generates React components from Figma designs using AI

import Anthropic from '@anthropic-ai/sdk';
import { ExtractedDesignData, ComponentNode } from './figma-extractor.js';
import { TailwindConverter } from './tailwind-converter.js';
import { DatabaseService } from './db-service.js';
import { CustomAIProvider } from './custom-ai-provider.js';

export interface GeneratedComponent {
  componentName: string;
  componentCode: string;
  propsInterface: string;
  imports: string[];
  dependencies: string[];
  metadata: {
    aiModel: string;
    generationPrompt: string;
    estimatedComplexity: string;
  };
}

export class ReactGenerator {
  private anthropic?: Anthropic;
  private customAI?: CustomAIProvider;
  private tailwindConverter: TailwindConverter;
  private dbService?: DatabaseService;
  private aiProvider: 'anthropic' | 'custom';

  constructor(
    apiKeyOrProvider: string | CustomAIProvider,
    dbService?: DatabaseService
  ) {
    if (typeof apiKeyOrProvider === 'string') {
      this.anthropic = new Anthropic({ apiKey: apiKeyOrProvider });
      this.aiProvider = 'anthropic';
    } else {
      this.customAI = apiKeyOrProvider;
      this.aiProvider = 'custom';
    }
    this.tailwindConverter = new TailwindConverter();
    this.dbService = dbService;
  }

  async generateComponent(
    designData: ExtractedDesignData,
    options: {
      componentName?: string;
      includeTypeScript?: boolean;
      includeComments?: boolean;
    } = {}
  ): Promise<GeneratedComponent> {
    const componentName = options.componentName || this.sanitizeComponentName(designData.node.name);
    const includeTypeScript = options.includeTypeScript ?? true;
    const includeComments = options.includeComments ?? false;

    // Fetch available components from database
    const availableComponents = this.dbService ? await this.dbService.getLumiereComponents() : [];

    const prompt = this.buildGenerationPrompt(designData, componentName, {
      includeTypeScript,
      includeComments,
    }, availableComponents);

    let generatedText: string;
    let aiModel: string;

    if (this.aiProvider === 'anthropic' && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      generatedText = response.content[0].type === 'text' ? response.content[0].text : '';
      aiModel = 'claude-3-5-sonnet-20241022';
    } else if (this.aiProvider === 'custom' && this.customAI) {
      generatedText = await this.customAI.generateCompletion(prompt, {
        maxTokens: 4096,
      });
      aiModel = process.env.CUSTOM_AI_NAME || 'Custom AI';
    } else {
      throw new Error('No AI provider configured');
    }

    const parsed = this.parseGeneratedCode(generatedText, componentName);

    return {
      componentName,
      componentCode: parsed.code,
      propsInterface: parsed.propsInterface,
      imports: parsed.imports,
      dependencies: ['react', 'lucide-react'],
      metadata: {
        aiModel,
        generationPrompt: prompt,
        estimatedComplexity: designData.metadata.complexity,
      },
    };
  }

  private buildGenerationPrompt(
    designData: ExtractedDesignData,
    componentName: string,
    options: { includeTypeScript: boolean; includeComments: boolean },
    availableComponents: any[] = []
  ): string {
    const { componentTree, designTokens, metadata } = designData;

    const componentDescription = this.describeComponents(componentTree);
    const designTokensDescription = this.describeDesignTokens(designTokens);
    const componentLibraryDescription = this.describeComponentLibrary(availableComponents);

    return `You are an expert React developer. Generate a clean, production-ready React component based on this Figma design.

${componentLibraryDescription ? `## Available Component Library
You MUST use these components from the design system instead of creating custom elements:

${componentLibraryDescription}

IMPORTANT: Use these components directly. Do NOT create custom buttons, inputs, or other elements if a component library equivalent exists.

` : ''}

## Component Name
${componentName}

## Design Analysis
${componentDescription}

## Design Tokens
${designTokensDescription}

## Metadata
- Total Elements: ${metadata.totalComponents}
- Has Interactive Elements: ${metadata.hasInteractiveElements}
- Has Images: ${metadata.hasImages}
- Has Text: ${metadata.hasText}
- Complexity: ${metadata.complexity}

## Requirements
1. Use React with ${options.includeTypeScript ? 'TypeScript' : 'JavaScript'}
2. ${availableComponents.length > 0 ? 'PRIORITY: Use the component library listed above for all UI elements (buttons, inputs, cards, etc.)' : 'Use Tailwind CSS for all styling (no inline styles)'}
3. ${availableComponents.length > 0 ? 'Only use custom styling for layout and spacing between components' : 'Use lucide-react for icons where appropriate'}
4. Make the component responsive (mobile-first approach)
5. Include proper TypeScript interfaces for props${options.includeTypeScript ? '' : ' (commented out)'}
6. Use semantic HTML elements for layout containers
7. Make interactive elements accessible (ARIA labels, keyboard navigation)
8. ${options.includeComments ? 'Include helpful comments explaining which design system component maps to which Figma element' : 'Do NOT include comments'}
9. Use functional components with hooks
10. Extract reusable parts into separate components if needed
11. ${availableComponents.length > 0 ? 'Import components from the paths shown in the component library above' : 'Keep styling consistent with the design tokens'}

## Output Format
Provide ONLY the code in this format:

\`\`\`tsx
// Imports from component library
${availableComponents.length > 0 ? '// Import components from their respective paths shown above' : '// import { Icon } from \'lucide-react\';'}
import React from 'react';

// Props interface
interface ${componentName}Props {
  // props here
}

// Main component
export function ${componentName}({ ...props }: ${componentName}Props) {
  return (
    // JSX here using component library components
  );
}

// Child components (if any)
\`\`\`

${availableComponents.length > 0 ? 'CRITICAL: You MUST use the component library components. Map each Figma element to the most appropriate component from the library above. For example:
- Figma button → Use the Button component from the library
- Figma text input → Use the FieldText/Input component from the library
- Figma card → Use the Card/Panel component from the library

Do NOT create custom HTML buttons, inputs, or styled divs when library components exist for those purposes.

' : ''}Generate the component now. Be creative but faithful to the design structure.`;
  }

  private describeComponents(componentTree: ComponentNode[]): string {
    const descriptions: string[] = [];

    const describe = (nodes: ComponentNode[], depth: number = 0) => {
      const indent = '  '.repeat(depth);

      for (const node of nodes) {
        const layoutClasses = this.tailwindConverter.convertLayout(node.layout);
        const styleClasses = this.tailwindConverter.convertStyles(node.styles);
        const allClasses = [...layoutClasses, ...styleClasses];

        descriptions.push(
          `${indent}- ${node.name} (${node.type}, role: ${node.role})`
        );

        if (allClasses.length > 0) {
          descriptions.push(`${indent}  Classes: ${allClasses.join(' ')}`);
        }

        if (node.content) {
          descriptions.push(`${indent}  Content: "${node.content}"`);
        }

        if (node.children.length > 0) {
          describe(node.children, depth + 1);
        }
      }
    };

    describe(componentTree);
    return descriptions.join('\n');
  }

  private describeDesignTokens(tokens: any): string {
    const lines: string[] = [];

    if (Object.keys(tokens.colors).length > 0) {
      lines.push('Colors:');
      Object.entries(tokens.colors).forEach(([name, value]) => {
        lines.push(`  - ${name}: ${value}`);
      });
    }

    if (tokens.spacing.length > 0) {
      lines.push(`Spacing: ${tokens.spacing.join(', ')}px`);
    }

    if (tokens.fontSizes.length > 0) {
      lines.push(`Font Sizes: ${tokens.fontSizes.join(', ')}px`);
    }

    if (tokens.borderRadii.length > 0) {
      lines.push(`Border Radii: ${tokens.borderRadii.join(', ')}px`);
    }

    return lines.join('\n');
  }

  private describeComponentLibrary(components: any[]): string {
    if (!components || components.length === 0) {
      return '';
    }

    const lines: string[] = [];

    // Group components by category
    const grouped: Record<string, any[]> = {};
    components.forEach(comp => {
      const category = comp.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(comp);
    });

    // Describe each category
    Object.entries(grouped).forEach(([category, comps]) => {
      lines.push(`\n### ${category}`);

      comps.forEach(comp => {
        lines.push(`\n**${comp.component_name}**`);
        lines.push(`- Import: \`import { ${comp.component_name} } from '${comp.component_path}';\``);

        if (comp.description) {
          lines.push(`- Purpose: ${comp.description}`);
        }

        if (comp.props && Object.keys(comp.props).length > 0) {
          const propsList = Object.entries(comp.props)
            .map(([key, value]: [string, any]) => `${key}: ${value.type || 'any'}`)
            .slice(0, 5);
          lines.push(`- Key Props: ${propsList.join(', ')}`);
        }

        if (comp.variants && Object.keys(comp.variants).length > 0) {
          const variantsList = Object.entries(comp.variants)
            .map(([key, values]: [string, any]) => `${key} (${Array.isArray(values) ? values.slice(0, 3).join(', ') : values})`)
            .slice(0, 3);
          lines.push(`- Variants: ${variantsList.join(', ')}`);
        }

        if (comp.usage_example) {
          lines.push(`- Example: \`${comp.usage_example}\``);
        }
      });
    });

    return lines.join('\n');
  }

  private parseGeneratedCode(
    generatedText: string,
    componentName: string
  ): {
    code: string;
    propsInterface: string;
    imports: string[];
  } {
    const codeBlockMatch = generatedText.match(/```(?:tsx|jsx|typescript|javascript)?\n([\s\S]+?)\n```/);
    const code = codeBlockMatch ? codeBlockMatch[1] : generatedText;

    const importMatches = code.match(/^import .+;$/gm) || [];
    const imports = importMatches.map(imp => imp.trim());

    const propsInterfaceMatch = code.match(
      new RegExp(`interface\\s+${componentName}Props\\s*{([\\s\\S]*?)}`, 'm')
    );
    const propsInterface = propsInterfaceMatch ? propsInterfaceMatch[0] : '';

    return {
      code: code.trim(),
      propsInterface: propsInterface.trim(),
      imports,
    };
  }

  private sanitizeComponentName(name: string): string {
    let sanitized = name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    if (!sanitized) {
      sanitized = 'Component';
    }

    if (!/^[A-Z]/.test(sanitized)) {
      sanitized = 'Component' + sanitized;
    }

    return sanitized;
  }

  async generateMultipleComponents(
    designData: ExtractedDesignData,
    splitStrategy: 'auto' | 'none' = 'auto'
  ): Promise<GeneratedComponent[]> {
    if (splitStrategy === 'none' || designData.metadata.complexity === 'simple') {
      const component = await this.generateComponent(designData);
      return [component];
    }

    const mainComponent = await this.generateComponent(designData, {
      componentName: this.sanitizeComponentName(designData.node.name),
    });

    return [mainComponent];
  }
}
