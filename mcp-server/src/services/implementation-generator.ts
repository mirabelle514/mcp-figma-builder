/**
 * Implementation Guide Generator
 * Generates implementation guides for using Lumiere components based on Figma designs
 */

interface ComponentMatch {
  component_name: string;
  component_path: string;
  confidence: number;
  matched_patterns: string[];
  suggested_props: Record<string, any>;
  figma_node_id: string;
  figma_node_name: string;
}

interface ImplementationGuide {
  overview: string;
  imports: string[];
  component_usage: ComponentUsage[];
  full_code: string;
  customization_notes: string[];
  design_tokens: DesignTokens;
  quick_prompts: QuickPrompt[];
}

interface ComponentUsage {
  component_name: string;
  props: Record<string, any>;
  code_snippet: string;
  figma_reference: string;
}

interface DesignTokens {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
}

interface QuickPrompt {
  question: string;
  category: string;
  applies_to: string;
}

export class ImplementationGenerator {
  /**
   * Generate implementation guide from component matches
   */
  generateGuide(
    matches: ComponentMatch[],
    figmaData: any
  ): ImplementationGuide {
    // Filter to high-confidence matches
    const highConfidenceMatches = matches.filter(m => m.confidence > 0.5);

    // Group by component name (remove duplicates)
    const uniqueMatches = this.deduplicateMatches(highConfidenceMatches);

    // Generate guide sections
    const overview = this.generateOverview(uniqueMatches);
    const imports = this.generateImports(uniqueMatches);
    const componentUsage = this.generateComponentUsage(uniqueMatches);
    const fullCode = this.generateFullCode(uniqueMatches, componentUsage);
    const customizationNotes = this.generateCustomizationNotes(uniqueMatches, figmaData);
    const designTokens = this.extractDesignTokens(figmaData);
    const quickPrompts = this.generateQuickPrompts(uniqueMatches);

    return {
      overview,
      imports,
      component_usage: componentUsage,
      full_code: fullCode,
      customization_notes: customizationNotes,
      design_tokens: designTokens,
      quick_prompts: quickPrompts,
    };
  }

  /**
   * Deduplicate matches by taking highest confidence for each component
   */
  private deduplicateMatches(matches: ComponentMatch[]): ComponentMatch[] {
    const componentMap = new Map<string, ComponentMatch>();

    for (const match of matches) {
      const existing = componentMap.get(match.component_name);
      if (!existing || match.confidence > existing.confidence) {
        componentMap.set(match.component_name, match);
      }
    }

    return Array.from(componentMap.values());
  }

  /**
   * Generate overview text
   */
  private generateOverview(matches: ComponentMatch[]): string {
    const componentNames = matches.map(m => m.component_name).join(', ');

    return `This Figma design can be implemented using ${matches.length} existing Lumiere components: ${componentNames}.

Below is a step-by-step implementation guide with code examples.`;
  }

  /**
   * Generate import statements
   */
  private generateImports(matches: ComponentMatch[]): string[] {
    // Group by import path
    const importMap = new Map<string, string[]>();

    for (const match of matches) {
      const path = match.component_path;
      if (!importMap.has(path)) {
        importMap.set(path, []);
      }
      importMap.get(path)!.push(match.component_name);
    }

    // Generate import statements
    const imports: string[] = [];
    for (const [path, components] of importMap) {
      imports.push(`import { ${components.join(', ')} } from '${path}';`);
    }

    return imports;
  }

  /**
   * Generate component usage examples
   */
  private generateComponentUsage(matches: ComponentMatch[]): ComponentUsage[] {
    return matches.map(match => {
      const props = match.suggested_props;
      const propsString = this.formatProps(props);

      return {
        component_name: match.component_name,
        props,
        code_snippet: `<${match.component_name}${propsString} />`,
        figma_reference: `Figma node: "${match.figma_node_name}" (${match.confidence.toFixed(0)}% match)`,
      };
    });
  }

  /**
   * Format props as JSX string
   */
  private formatProps(props: Record<string, any>): string {
    if (Object.keys(props).length === 0) return '';

    const propsArray = Object.entries(props).map(([key, value]) => {
      if (typeof value === 'string') {
        if (key === 'children') {
          return null; // Handle children separately
        }
        return `${key}="${value}"`;
      }
      if (typeof value === 'boolean') {
        return value ? key : null;
      }
      return `${key}={${JSON.stringify(value)}}`;
    }).filter(Boolean);

    return propsArray.length > 0 ? ' ' + propsArray.join(' ') : '';
  }

  /**
   * Generate full implementation code
   */
  private generateFullCode(
    matches: ComponentMatch[],
    usage: ComponentUsage[]
  ): string {
    const imports = this.generateImports(matches);

    let code = '// Implementation using Lumiere Design System components\n\n';
    code += imports.join('\n') + '\n\n';
    code += 'export default function DesignImplementation() {\n';
    code += '  return (\n';
    code += '    <div className="design-container">\n';

    // Generate component hierarchy
    for (const component of usage) {
      const indent = '      ';
      const children = component.props.children;

      if (children) {
        code += `${indent}<${component.component_name}${this.formatProps(component.props)}>\n`;
        code += `${indent}  ${children}\n`;
        code += `${indent}</${component.component_name}>\n`;
      } else {
        code += `${indent}${component.code_snippet}\n`;
      }
    }

    code += '    </div>\n';
    code += '  );\n';
    code += '}\n';

    return code;
  }

  /**
   * Generate customization notes
   */
  private generateCustomizationNotes(
    matches: ComponentMatch[],
    figmaData: any
  ): string[] {
    const notes: string[] = [];

    // Add notes about matched components
    notes.push('## Matched Components');
    for (const match of matches) {
      notes.push(`- **${match.component_name}**: ${match.confidence.toFixed(0)}% match (patterns: ${match.matched_patterns.join(', ')})`);
    }

    // Add notes about design tokens
    notes.push('\n## Design Customization');
    notes.push('- Extract colors from Figma and add to your Tailwind config');
    notes.push('- Verify spacing matches your design system scale (8px grid)');
    notes.push('- Check typography scales (font-size, line-height, font-weight)');

    // Add notes about responsive design
    notes.push('\n## Responsive Considerations');
    notes.push('- Add breakpoint-specific classes (sm:, md:, lg:)');
    notes.push('- Test on mobile, tablet, and desktop viewports');
    notes.push('- Consider touch targets for mobile (min 44x44px)');

    // Add accessibility notes
    notes.push('\n## Accessibility');
    notes.push('- Verify color contrast ratios (WCAG AA: 4.5:1 for text)');
    notes.push('- Add ARIA labels where needed');
    notes.push('- Test keyboard navigation');
    notes.push('- Ensure focus indicators are visible');

    return notes;
  }

  /**
   * Extract design tokens from Figma data
   */
  private extractDesignTokens(figmaData: any): DesignTokens {
    const tokens: DesignTokens = {
      colors: {},
      spacing: {},
      typography: {},
    };

    // Extract colors from fills
    if (figmaData.fills) {
      figmaData.fills.forEach((fill: any, index: number) => {
        if (fill.type === 'SOLID' && fill.color) {
          const { r, g, b, a } = fill.color;
          const hex = this.rgbaToHex(r, g, b, a);
          tokens.colors[`color-${index + 1}`] = hex;
        }
      });
    }

    // Extract spacing (padding, gaps)
    if (figmaData.paddingLeft) {
      tokens.spacing['padding-x'] = `${figmaData.paddingLeft}px`;
    }
    if (figmaData.paddingTop) {
      tokens.spacing['padding-y'] = `${figmaData.paddingTop}px`;
    }
    if (figmaData.itemSpacing) {
      tokens.spacing['gap'] = `${figmaData.itemSpacing}px`;
    }

    // Extract typography
    if (figmaData.style) {
      const style = figmaData.style;
      if (style.fontSize) {
        tokens.typography['font-size'] = `${style.fontSize}px`;
      }
      if (style.fontWeight) {
        tokens.typography['font-weight'] = String(style.fontWeight);
      }
      if (style.lineHeightPx) {
        tokens.typography['line-height'] = `${style.lineHeightPx}px`;
      }
    }

    return tokens;
  }

  /**
   * Generate quick prompts for customization
   */
  private generateQuickPrompts(matches: ComponentMatch[]): QuickPrompt[] {
    const prompts: QuickPrompt[] = [];

    // Styling prompts
    prompts.push({
      question: 'Do you want to customize the colors?',
      category: 'styling',
      applies_to: 'all',
    });

    prompts.push({
      question: 'Do you need to adjust spacing (padding, margins, gaps)?',
      category: 'styling',
      applies_to: 'all',
    });

    // Responsive prompts
    prompts.push({
      question: 'Should this design be responsive? (mobile, tablet, desktop)',
      category: 'responsive',
      applies_to: 'all',
    });

    // Component-specific prompts
    if (matches.some(m => m.component_name.toLowerCase().includes('button'))) {
      prompts.push({
        question: 'What should happen when the button is clicked?',
        category: 'behavior',
        applies_to: 'Button',
      });
    }

    if (matches.some(m => m.component_name.toLowerCase().includes('nav'))) {
      prompts.push({
        question: 'Do you need a mobile menu for the navigation?',
        category: 'responsive',
        applies_to: 'Navigation',
      });
    }

    if (matches.some(m => m.component_name.toLowerCase().includes('form') || m.component_name.toLowerCase().includes('input'))) {
      prompts.push({
        question: 'Do you need form validation?',
        category: 'behavior',
        applies_to: 'Form',
      });
    }

    return prompts;
  }

  /**
   * Convert RGBA to hex color
   */
  private rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    return a < 1 ? hex + toHex(a) : hex;
  }

  /**
   * Format implementation guide as markdown
   */
  formatAsMarkdown(guide: ImplementationGuide): string {
    let md = '# Implementation Guide\n\n';

    // Overview
    md += '## Overview\n\n';
    md += guide.overview + '\n\n';

    // Components
    md += '## Components Used\n\n';
    for (const usage of guide.component_usage) {
      md += `### ${usage.component_name}\n\n`;
      md += `${usage.figma_reference}\n\n`;
      md += '```tsx\n';
      md += usage.code_snippet + '\n';
      md += '```\n\n';
    }

    // Full implementation
    md += '## Full Implementation\n\n';
    md += '```tsx\n';
    md += guide.full_code;
    md += '```\n\n';

    // Design tokens
    md += '## Design Tokens\n\n';
    if (Object.keys(guide.design_tokens.colors).length > 0) {
      md += '### Colors\n\n';
      for (const [name, value] of Object.entries(guide.design_tokens.colors)) {
        md += `- **${name}**: \`${value}\`\n`;
      }
      md += '\n';
    }

    // Customization notes
    md += '## Customization Notes\n\n';
    md += guide.customization_notes.join('\n') + '\n\n';

    // Quick prompts
    md += '## Quick Customization Questions\n\n';
    for (const prompt of guide.quick_prompts) {
      md += `- **${prompt.category}**: ${prompt.question}\n`;
    }
    md += '\n';

    return md;
  }
}
