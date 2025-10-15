/**
 * Figma to Lumiere Component Matcher
 * Analyzes Figma designs and matches them to existing Lumiere components
 */

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  characters?: string;
  style?: any;
}

interface LumiereComponentMatch {
  component_name: string;
  component_path: string;
  confidence: number;
  matched_patterns: string[];
  suggested_props: Record<string, any>;
  figma_node_id: string;
  figma_node_name: string;
}

interface ComponentMapping {
  component_name: string;
  component_path: string;
  visual_patterns: string[];
  figma_keywords: string[];
  props: Record<string, any>;
  variants: Record<string, string[]>;
}

export class FigmaMatcher {
  private componentMappings: ComponentMapping[] = [];

  /**
   * Load component mappings from database
   */
  async loadComponentMappings(mappings: ComponentMapping[]): Promise<void> {
    this.componentMappings = mappings;
  }

  /**
   * Analyze Figma node and find matching Lumiere components
   */
  async matchNode(node: FigmaNode): Promise<LumiereComponentMatch[]> {
    const matches: LumiereComponentMatch[] = [];

    // Detect node patterns
    const patterns = this.detectPatterns(node);
    const keywords = this.extractKeywords(node);

    // Match against each component
    for (const component of this.componentMappings) {
      const confidence = this.calculateConfidence(
        patterns,
        keywords,
        component
      );

      if (confidence > 0.3) {
        matches.push({
          component_name: component.component_name,
          component_path: component.component_path,
          confidence,
          matched_patterns: this.getMatchedPatterns(patterns, component.visual_patterns),
          suggested_props: this.extractPropsFromNode(node, component),
          figma_node_id: node.id,
          figma_node_name: node.name,
        });
      }
    }

    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence);

    return matches;
  }

  /**
   * Analyze entire Figma design and return all matches
   */
  async matchDesign(rootNode: FigmaNode): Promise<LumiereComponentMatch[]> {
    const allMatches: LumiereComponentMatch[] = [];

    // Recursively match all nodes
    await this.matchNodeRecursive(rootNode, allMatches);

    return allMatches;
  }

  /**
   * Recursively match nodes in the tree
   */
  private async matchNodeRecursive(
    node: FigmaNode,
    matches: LumiereComponentMatch[]
  ): Promise<void> {
    // Match current node
    const nodeMatches = await this.matchNode(node);
    matches.push(...nodeMatches);

    // Match children
    if (node.children) {
      for (const child of node.children) {
        await this.matchNodeRecursive(child, matches);
      }
    }
  }

  /**
   * Detect visual patterns from Figma node
   */
  private detectPatterns(node: FigmaNode): string[] {
    const patterns: string[] = [];

    // Detect by node type
    if (node.type === 'FRAME' || node.type === 'COMPONENT') {
      patterns.push('container');
    }
    if (node.type === 'TEXT') {
      patterns.push('text', 'typography');
    }
    if (node.type === 'RECTANGLE' && this.hasInteractiveProperties(node)) {
      patterns.push('clickable', 'interactive');
    }

    // Detect by layout
    if (node.layoutMode === 'HORIZONTAL') {
      patterns.push('horizontal-layout', 'flex-layout');
    }
    if (node.layoutMode === 'VERTICAL') {
      patterns.push('vertical-layout', 'flex-layout');
    }

    // Detect by name patterns
    const name = node.name.toLowerCase();
    if (name.includes('button') || name.includes('btn')) {
      patterns.push('button', 'clickable', 'call-to-action');
    }
    if (name.includes('hero') || name.includes('banner')) {
      patterns.push('hero', 'large-header', 'banner', 'featured-section');
    }
    if (name.includes('card')) {
      patterns.push('card', 'container', 'bordered-section', 'content-block');
    }
    if (name.includes('nav') || name.includes('menu')) {
      patterns.push('navigation', 'horizontal-menu', 'header');
    }
    if (name.includes('input') || name.includes('field')) {
      patterns.push('input', 'text-field', 'form-control', 'user-input');
    }
    if (name.includes('modal') || name.includes('dialog')) {
      patterns.push('modal', 'dialog', 'overlay');
    }
    if (name.includes('footer')) {
      patterns.push('footer', 'bottom-section');
    }

    // Detect by visual properties
    if (this.hasBackgroundColor(node)) {
      patterns.push('colored-background');
    }
    if (this.hasBorder(node)) {
      patterns.push('bordered-section');
    }
    if (this.hasShadow(node)) {
      patterns.push('elevated', 'card-like');
    }

    return patterns;
  }

  /**
   * Extract keywords from Figma node name
   */
  private extractKeywords(node: FigmaNode): string[] {
    const name = node.name.toLowerCase();

    // Split by common separators
    const keywords = name
      .split(/[\s\-_\/]+/)
      .filter(word => word.length > 2);

    return keywords;
  }

  /**
   * Calculate confidence score for a component match
   */
  private calculateConfidence(
    patterns: string[],
    keywords: string[],
    component: ComponentMapping
  ): number {
    let score = 0;
    let maxScore = 0;

    // Pattern matching (weight: 0.6)
    maxScore += 0.6;
    const patternMatches = patterns.filter(p =>
      component.visual_patterns.includes(p)
    ).length;
    if (component.visual_patterns.length > 0) {
      score += (patternMatches / component.visual_patterns.length) * 0.6;
    }

    // Keyword matching (weight: 0.4)
    maxScore += 0.4;
    const keywordMatches = keywords.filter(k =>
      component.figma_keywords.some(ck => ck.includes(k) || k.includes(ck))
    ).length;
    if (keywords.length > 0) {
      score += (keywordMatches / keywords.length) * 0.4;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get patterns that matched
   */
  private getMatchedPatterns(
    nodePatterns: string[],
    componentPatterns: string[]
  ): string[] {
    return nodePatterns.filter(p => componentPatterns.includes(p));
  }

  /**
   * Extract props from Figma node based on component schema
   */
  private extractPropsFromNode(
    node: FigmaNode,
    component: ComponentMapping
  ): Record<string, any> {
    const props: Record<string, any> = {};

    // Extract text content
    if (node.characters && 'children' in component.props) {
      props.children = node.characters;
    }

    // Extract variant based on naming
    if (component.variants.variant) {
      const name = node.name.toLowerCase();
      for (const variant of component.variants.variant) {
        if (name.includes(variant.toLowerCase())) {
          props.variant = variant;
          break;
        }
      }
    }

    // Extract size based on dimensions or naming
    if (component.variants.size) {
      const name = node.name.toLowerCase();
      if (name.includes('large') || name.includes('lg')) {
        props.size = 'large';
      } else if (name.includes('small') || name.includes('sm')) {
        props.size = 'small';
      } else {
        props.size = 'medium';
      }
    }

    // Extract className if component accepts it
    if ('className' in component.props) {
      props.className = '';
    }

    return props;
  }

  /**
   * Check if node has interactive properties
   */
  private hasInteractiveProperties(node: FigmaNode): boolean {
    // Check if node name suggests interactivity
    const name = node.name.toLowerCase();
    return (
      name.includes('button') ||
      name.includes('click') ||
      name.includes('link') ||
      name.includes('cta')
    );
  }

  /**
   * Check if node has background color
   */
  private hasBackgroundColor(node: FigmaNode): boolean {
    return !!node.fills && node.fills.length > 0;
  }

  /**
   * Check if node has border
   */
  private hasBorder(node: FigmaNode): boolean {
    return !!node.strokes && node.strokes.length > 0;
  }

  /**
   * Check if node has shadow effect
   */
  private hasShadow(node: FigmaNode): boolean {
    return !!node.effects && node.effects.some(e =>
      e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW'
    );
  }
}
