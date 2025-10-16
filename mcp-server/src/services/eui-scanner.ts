/**
 * EUI Component Scanner
 * Scans the EUI Design System repository and extracts component metadata
 */

interface EuiComponent {
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

export class EuiScanner {
  private repoOwner: string;
  private repoName: string;
  private githubToken?: string;

  constructor(repoOwner: string, repoName: string, githubToken?: string) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;
    this.githubToken = githubToken;
  }

  /**
   * Scan the EUI repository and extract all components
   */
  async scanRepository(): Promise<EuiComponent[]> {
    const components: EuiComponent[] = [];

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
          break;
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
  private async parseComponent(file: GitHubFileContent): Promise<EuiComponent | null> {
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

  private extractComponentName(filename: string): string {
    return filename.replace(/\.(tsx|jsx)$/, '');
  }

  private generateImportPath(filePath: string): string {
    const match = filePath.match(/components\/(.+)\.(tsx|jsx)$/);
    if (match) {
      const componentPath = match[1].replace(/\/\w+$/, '');
      return `@elastic/eui/${componentPath}`;
    }
    return filePath;
  }

  private extractDescription(content: string): string {
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/);
    if (jsdocMatch) {
      return jsdocMatch[1].trim();
    }

    const commentMatch = content.match(/\/\/\s*(.+?component.+)/i);
    return commentMatch ? commentMatch[1].trim() : '';
  }

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

  private extractProps(content: string): Record<string, any> {
    const props: Record<string, any> = {};

    const interfaceMatch = content.match(/interface\s+\w+Props\s*{([^}]+)}/);
    const typeMatch = content.match(/type\s+\w+Props\s*=\s*{([^}]+)}/);

    const propsContent = interfaceMatch?.[1] || typeMatch?.[1];
    if (!propsContent) return props;

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

  private extractVariants(content: string): Record<string, string[]> {
    const variants: Record<string, string[]> = {};

    const variantMatch = content.match(/variant\??:\s*['"](\w+)['"]\s*\|\s*['"](\w+)['"]/);
    if (variantMatch) {
      const variantValues = content.match(/['"](\w+)['"]/g);
      if (variantValues) {
        variants.variant = variantValues.map(v => v.replace(/['"]/g, ''));
      }
    }

    const sizeMatch = content.match(/size\??:\s*['"](\w+)['"]\s*\|\s*['"](\w+)['"]/);
    if (sizeMatch) {
      const sizeValues = content.match(/size.*?['"](\w+)['"]/g);
      if (sizeValues) {
        variants.size = sizeValues.map(v => v.match(/['"](\w+)['"]/)?.[1] || '');
      }
    }

    return variants;
  }

  private detectVisualPatterns(name: string, content: string): string[] {
    const patterns: string[] = [];
    const lowerName = name.toLowerCase();

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

    if (content.includes('grid') || content.includes('Grid')) {
      patterns.push('grid-layout');
    }
    if (content.includes('flex') || content.includes('Flex')) {
      patterns.push('flex-layout');
    }

    return patterns;
  }

  private generateFigmaKeywords(name: string): string[] {
    const keywords: string[] = [name.toLowerCase()];

    keywords.push(
      name.replace(/([A-Z])/g, ' $1').trim().toLowerCase(),
      name.replace(/([A-Z])/g, '-$1').toLowerCase(),
    );

    return [...new Set(keywords)];
  }

  private extractUsageExample(content: string, componentName: string): string {
    const exampleMatch = content.match(/\/\*\*.*?@example\s*\n\s*\*\s*```(tsx?|jsx?)?\n([\s\S]*?)```/);
    if (exampleMatch) {
      return exampleMatch[2].trim();
    }

    return `import { ${componentName} } from '@elastic/eui';\n\n<${componentName} />`;
  }
}
