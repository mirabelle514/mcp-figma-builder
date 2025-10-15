/**
 * Lumiere Component Scanner
 * Scans the Lumiere Design System repository and extracts component metadata
 */

interface LumiereComponent {
  component_name: string;
  component_path: string;
  description: string;
  category: string;
  props: Record<string, any>;
  variants: Record<string, string[]>;
  visual_patterns: string[];
  figma_keywords: string[];
  usage_example: string;
  repo_url: string;
}

interface GitHubFileContent {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
}

export class LumiereScanner {
  private repoOwner = 'your-org';
  private repoName = 'lumiere-design-system';
  private githubToken?: string;

  constructor(githubToken?: string) {
    this.githubToken = githubToken;
  }

  /**
   * Scan the Lumiere repository and extract all components
   */
  async scanRepository(): Promise<LumiereComponent[]> {
    const components: LumiereComponent[] = [];

    // Get all component files from the repo
    const componentFiles = await this.getComponentFiles();

    for (const file of componentFiles) {
      const component = await this.parseComponent(file);
      if (component) {
        components.push(component);
      }
    }

    return components;
  }

  /**
   * Fetch component files from GitHub
   */
  private async getComponentFiles(): Promise<GitHubFileContent[]> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`;
    }

    // Scan common component directories
    const directories = ['src/components', 'components', 'lib/components'];
    const files: GitHubFileContent[] = [];

    for (const dir of directories) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${dir}`,
          { headers }
        );

        if (response.ok) {
          const contents = await response.json();
          files.push(...contents);
          break; // Found the components directory
        }
      } catch (error) {
        console.warn(`Directory ${dir} not found, trying next...`);
      }
    }

    return files;
  }

  /**
   * Parse a component file and extract metadata
   */
  private async parseComponent(file: GitHubFileContent): Promise<LumiereComponent | null> {
    if (file.type !== 'file' || !file.name.match(/\.(tsx|jsx)$/)) {
      return null;
    }

    const content = await this.fetchFileContent(file.path);
    if (!content) return null;

    const componentName = this.extractComponentName(file.name);

    return {
      component_name: componentName,
      component_path: this.generateImportPath(file.path),
      description: this.extractDescription(content),
      category: this.categorizeComponent(componentName, content),
      props: this.extractProps(content),
      variants: this.extractVariants(content),
      visual_patterns: this.detectVisualPatterns(componentName, content),
      figma_keywords: this.generateFigmaKeywords(componentName),
      usage_example: this.extractUsageExample(content, componentName),
      repo_url: `https://github.com/${this.repoOwner}/${this.repoName}/blob/main/${file.path}`,
    };
  }

  /**
   * Fetch file content from GitHub
   */
  private async fetchFileContent(path: string): Promise<string | null> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3.raw',
    };

    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`;
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${path}`,
        { headers }
      );

      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error(`Failed to fetch ${path}:`, error);
    }

    return null;
  }

  /**
   * Extract component name from filename
   */
  private extractComponentName(filename: string): string {
    return filename.replace(/\.(tsx|jsx)$/, '');
  }

  /**
   * Generate import path
   */
  private generateImportPath(filePath: string): string {
    // Convert file path to import path
    // Example: src/components/Button/Button.tsx -> @lumiere/components/Button
    const match = filePath.match(/components\/(.+)\.(tsx|jsx)$/);
    if (match) {
      const componentPath = match[1].replace(/\/\w+$/, ''); // Remove filename if in subfolder
      return `@lumiere/components/${componentPath}`;
    }
    return filePath;
  }

  /**
   * Extract component description from JSDoc comments
   */
  private extractDescription(content: string): string {
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }

    // Fallback: extract from component comments
    const commentMatch = content.match(/\/\/\s*(.+?component.+)/i);
    return commentMatch ? commentMatch[1].trim() : '';
  }

  /**
   * Categorize component based on name and content
   */
  private categorizeComponent(name: string, content: string): string {
    const categories = {
      navigation: ['navbar', 'nav', 'menu', 'sidebar', 'breadcrumb', 'tabs'],
      layout: ['container', 'grid', 'flex', 'section', 'hero', 'footer', 'header'],
      forms: ['input', 'button', 'form', 'select', 'checkbox', 'radio', 'textarea'],
      display: ['card', 'modal', 'dialog', 'tooltip', 'popover', 'badge', 'avatar'],
      feedback: ['alert', 'toast', 'notification', 'spinner', 'loader', 'progress'],
      typography: ['heading', 'text', 'paragraph', 'title'],
    };

    const lowerName = name.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerName.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  /**
   * Extract props interface from TypeScript
   */
  private extractProps(content: string): Record<string, any> {
    const props: Record<string, any> = {};

    // Match interface or type definitions
    const interfaceMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
    const typeMatch = content.match(/type\s+\w+Props\s*=\s*{([^}]+)}/);

    const propsContent = interfaceMatch?.[1] || typeMatch?.[1];
    if (!propsContent) return props;

    // Parse prop definitions
    const propLines = propsContent.split('\n');
    for (const line of propLines) {
      const propMatch = line.match(/(\w+)(\?)?:\s*(.+?)(;|$)/);
      if (propMatch) {
        const [, propName, optional, propType] = propMatch;
        props[propName] = {
          type: propType.trim(),
          required: !optional,
        };
      }
    }

    return props;
  }

  /**
   * Extract component variants
   */
  private extractVariants(content: string): Record<string, string[]> {
    const variants: Record<string, string[]> = {};

    // Look for variant prop definitions
    const variantMatch = content.match(/variant\??:\s*['"](\w+)['"]\s*\|\s*['"](\w+)['"]/);
    if (variantMatch) {
      const variantValues = content.match(/['"](\w+)['"]/g);
      if (variantValues) {
        variants.variant = variantValues.map(v => v.replace(/['"]/g, ''));
      }
    }

    // Look for size prop
    const sizeMatch = content.match(/size\??:\s*['"](\w+)['"]\s*\|\s*['"](\w+)['"]/);
    if (sizeMatch) {
      const sizeValues = content.match(/size.*?['"](\w+)['"]/g);
      if (sizeValues) {
        variants.size = sizeValues.map(v => v.match(/['"](\w+)['"]/)?.[1] || '');
      }
    }

    return variants;
  }

  /**
   * Detect visual patterns this component represents
   */
  private detectVisualPatterns(name: string, content: string): string[] {
    const patterns: string[] = [];
    const lowerName = name.toLowerCase();

    // Pattern detection based on component name
    if (lowerName.includes('button')) {
      patterns.push('clickable', 'call-to-action', 'interactive');
    }
    if (lowerName.includes('hero')) {
      patterns.push('large-header', 'banner', 'featured-section');
    }
    if (lowerName.includes('card')) {
      patterns.push('container', 'bordered-section', 'content-block');
    }
    if (lowerName.includes('nav')) {
      patterns.push('horizontal-menu', 'navigation', 'header');
    }
    if (lowerName.includes('input')) {
      patterns.push('text-field', 'form-control', 'user-input');
    }

    // Detect patterns from content
    if (content.includes('grid') || content.includes('Grid')) {
      patterns.push('grid-layout');
    }
    if (content.includes('flex') || content.includes('Flex')) {
      patterns.push('flex-layout');
    }

    return patterns;
  }

  /**
   * Generate Figma keywords for matching
   */
  private generateFigmaKeywords(name: string): string[] {
    const keywords: string[] = [name.toLowerCase()];

    // Add common variations
    keywords.push(
      name.replace(/([A-Z])/g, ' $1').trim().toLowerCase(), // CamelCase to spaces
      name.replace(/([A-Z])/g, '-$1').toLowerCase(), // CamelCase to kebab-case
    );

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Extract usage example from component file
   */
  private extractUsageExample(content: string, componentName: string): string {
    // Look for example in comments
    const exampleMatch = content.match(/\/\*\*.*?@example\s*\n\s*\*\s*```(tsx?|jsx?)?\n([\s\S]*?)```/);
    if (exampleMatch) {
      return exampleMatch[2].trim();
    }

    // Generate basic example
    return `import { ${componentName} } from '@lumiere/components';\n\n<${componentName} />`;
  }
}
