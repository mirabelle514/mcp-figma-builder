// Generates React components from Figma designs using AI

import Anthropic from '@anthropic-ai/sdk';
import { ExtractedDesignData, ComponentNode } from './figma-extractor.js';
import { TailwindConverter } from './tailwind-converter.js';

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
  private anthropic: Anthropic;
  private tailwindConverter: TailwindConverter;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.tailwindConverter = new TailwindConverter();
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

    const prompt = this.buildGenerationPrompt(designData, componentName, {
      includeTypeScript,
      includeComments,
    });

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

    const generatedText = response.content[0].type === 'text' ? response.content[0].text : '';
    const parsed = this.parseGeneratedCode(generatedText, componentName);

    return {
      componentName,
      componentCode: parsed.code,
      propsInterface: parsed.propsInterface,
      imports: parsed.imports,
      dependencies: ['react', 'lucide-react'],
      metadata: {
        aiModel: 'claude-3-5-sonnet-20241022',
        generationPrompt: prompt,
        estimatedComplexity: designData.metadata.complexity,
      },
    };
  }

  private buildGenerationPrompt(
    designData: ExtractedDesignData,
    componentName: string,
    options: { includeTypeScript: boolean; includeComments: boolean }
  ): string {
    const { componentTree, designTokens, metadata } = designData;

    const componentDescription = this.describeComponents(componentTree);
    const designTokensDescription = this.describeDesignTokens(designTokens);

    return `You are an expert React developer. Generate a clean, production-ready React component based on this Figma design.

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
2. Use Tailwind CSS for all styling (no inline styles)
3. Use lucide-react for icons where appropriate
4. Make the component responsive (mobile-first approach)
5. Include proper TypeScript interfaces for props${options.includeTypeScript ? '' : ' (commented out)'}
6. Use semantic HTML elements
7. Make interactive elements accessible (ARIA labels, keyboard navigation)
8. ${options.includeComments ? 'Include helpful comments' : 'Do NOT include comments'}
9. Use functional components with hooks
10. Extract reusable parts into separate components if needed

## Output Format
Provide ONLY the code in this format:

\`\`\`tsx
// Imports
import React from 'react';
import { Icon } from 'lucide-react';

// Props interface
interface ${componentName}Props {
  // props here
}

// Main component
export function ${componentName}({ ...props }: ${componentName}Props) {
  return (
    // JSX here
  );
}

// Child components (if any)
\`\`\`

Generate the component now. Be creative but faithful to the design structure.`;
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
