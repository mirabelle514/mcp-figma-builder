// Enhanced Figma data extraction for React code generation

export interface FigmaNodeComplete {
  id: string;
  name: string;
  type: string;
  visible?: boolean;

  // Layout properties
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Auto-layout properties
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutWrap?: 'NO_WRAP' | 'WRAP';

  // Style properties
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];

  // Effects (shadows, blurs)
  effects?: FigmaEffect[];

  // Text properties
  characters?: string;
  style?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  };

  // Constraints
  constraints?: {
    vertical: 'TOP' | 'BOTTOM' | 'CENTER' | 'TOP_BOTTOM' | 'SCALE';
    horizontal: 'LEFT' | 'RIGHT' | 'CENTER' | 'LEFT_RIGHT' | 'SCALE';
  };

  // Opacity and blend
  opacity?: number;
  blendMode?: string;

  // Children
  children?: FigmaNodeComplete[];

  // Component properties
  componentPropertyReferences?: Record<string, string>;
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'IMAGE';
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  opacity?: number;
  visible?: boolean;
  gradientStops?: Array<{
    position: number;
    color: { r: number; g: number; b: number; a: number };
  }>;
  imageRef?: string;
}

export interface FigmaStroke {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  opacity?: number;
  visible?: boolean;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  offset?: {
    x: number;
    y: number;
  };
  blendMode?: string;
}

export interface ExtractedDesignData {
  node: FigmaNodeComplete;
  componentTree: ComponentNode[];
  designTokens: DesignTokens;
  metadata: {
    totalComponents: number;
    hasInteractiveElements: boolean;
    hasImages: boolean;
    hasText: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface ComponentNode {
  id: string;
  name: string;
  type: string;
  role: 'container' | 'button' | 'input' | 'text' | 'image' | 'card' | 'list' | 'navigation' | 'unknown';
  layout: LayoutInfo;
  styles: StyleInfo;
  content?: string;
  children: ComponentNode[];
}

export interface LayoutInfo {
  display: 'flex' | 'grid' | 'block';
  direction?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  width?: number | 'auto' | 'full';
  height?: number | 'auto' | 'full';
  wrap?: boolean;
}

export interface StyleInfo {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  opacity?: number;
}

export interface DesignTokens {
  colors: Record<string, string>;
  spacing: number[];
  fontSizes: number[];
  borderRadii: number[];
  shadows: string[];
}

export class FigmaExtractor {
  extractDesignData(node: FigmaNodeComplete): ExtractedDesignData {
    const componentTree = this.buildComponentTree(node);
    const designTokens = this.extractDesignTokens(node);
    const metadata = this.analyzeMetadata(node);

    return {
      node,
      componentTree,
      designTokens,
      metadata,
    };
  }

  private buildComponentTree(node: FigmaNodeComplete): ComponentNode[] {
    return this.traverseNode(node);
  }

  private traverseNode(node: FigmaNodeComplete): ComponentNode[] {
    const role = this.identifyRole(node);
    const layout = this.extractLayout(node);
    const styles = this.extractStyles(node);
    const content = node.characters;

    const componentNode: ComponentNode = {
      id: node.id,
      name: node.name,
      type: node.type,
      role,
      layout,
      styles,
      content,
      children: [],
    };

    if (node.children) {
      componentNode.children = node.children.flatMap(child => this.traverseNode(child));
    }

    return [componentNode];
  }

  private identifyRole(node: FigmaNodeComplete): ComponentNode['role'] {
    const name = node.name.toLowerCase();
    const type = node.type;

    if (type === 'TEXT') return 'text';
    if (type === 'RECTANGLE' && node.fills?.some(f => f.type === 'IMAGE')) return 'image';

    // Button detection
    if (name.includes('button') || name.includes('btn')) return 'button';
    if (name.includes('cta') || name.includes('action')) return 'button';

    // Input detection
    if (name.includes('input') || name.includes('field')) return 'input';
    if (name.includes('search') || name.includes('textbox')) return 'input';

    // Card detection
    if (name.includes('card')) return 'card';

    // Navigation detection
    if (name.includes('nav') || name.includes('menu')) return 'navigation';
    if (name.includes('header') || name.includes('footer')) return 'navigation';

    // List detection
    if (name.includes('list') || name.includes('grid')) return 'list';

    // Container detection
    if (node.layoutMode !== 'NONE') return 'container';
    if (node.children && node.children.length > 0) return 'container';

    return 'unknown';
  }

  private extractLayout(node: FigmaNodeComplete): LayoutInfo {
    const layout: LayoutInfo = {
      display: 'block',
    };

    // Auto-layout detection
    if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
      layout.display = 'flex';
      layout.direction = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      if (node.primaryAxisAlignItems === 'CENTER') {
        layout.justifyContent = 'center';
      } else if (node.primaryAxisAlignItems === 'MAX') {
        layout.justifyContent = 'flex-end';
      } else if (node.primaryAxisAlignItems === 'SPACE_BETWEEN') {
        layout.justifyContent = 'space-between';
      }

      if (node.counterAxisAlignItems === 'CENTER') {
        layout.alignItems = 'center';
      } else if (node.counterAxisAlignItems === 'MAX') {
        layout.alignItems = 'flex-end';
      }

      layout.gap = node.itemSpacing || 0;
      layout.wrap = node.layoutWrap === 'WRAP';
    }

    // Padding
    if (node.paddingTop || node.paddingRight || node.paddingBottom || node.paddingLeft) {
      layout.padding = {
        top: node.paddingTop || 0,
        right: node.paddingRight || 0,
        bottom: node.paddingBottom || 0,
        left: node.paddingLeft || 0,
      };
    }

    // Size
    if (node.absoluteBoundingBox) {
      layout.width = node.absoluteBoundingBox.width;
      layout.height = node.absoluteBoundingBox.height;
    }

    return layout;
  }

  private extractStyles(node: FigmaNodeComplete): StyleInfo {
    const styles: StyleInfo = {};

    // Background color
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        styles.backgroundColor = this.rgbaToHex(fill.color);
      }
    }

    // Text styles
    if (node.style) {
      if (node.style.fontSize) styles.fontSize = node.style.fontSize;
      if (node.style.fontWeight) styles.fontWeight = node.style.fontWeight;
      if (node.style.fontFamily) styles.fontFamily = node.style.fontFamily;
    }

    // Border radius
    if (node.cornerRadius) {
      styles.borderRadius = node.cornerRadius;
    }

    // Border
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0];
      styles.borderWidth = node.strokeWeight;
      if (stroke.color) {
        styles.borderColor = this.rgbaToHex(stroke.color);
      }
    }

    // Box shadow
    if (node.effects && node.effects.length > 0) {
      const shadow = node.effects.find(e => e.type === 'DROP_SHADOW' && e.visible !== false);
      if (shadow && shadow.offset && shadow.color) {
        styles.boxShadow = `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius || 0}px ${this.rgbaToHex(shadow.color)}`;
      }
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
      styles.opacity = node.opacity;
    }

    return styles;
  }

  private extractDesignTokens(node: FigmaNodeComplete): DesignTokens {
    const tokens: DesignTokens = {
      colors: {},
      spacing: [],
      fontSizes: [],
      borderRadii: [],
      shadows: [],
    };

    this.collectTokens(node, tokens);

    // Deduplicate and sort
    tokens.spacing = [...new Set(tokens.spacing)].sort((a, b) => a - b);
    tokens.fontSizes = [...new Set(tokens.fontSizes)].sort((a, b) => a - b);
    tokens.borderRadii = [...new Set(tokens.borderRadii)].sort((a, b) => a - b);
    tokens.shadows = [...new Set(tokens.shadows)];

    return tokens;
  }

  private collectTokens(node: FigmaNodeComplete, tokens: DesignTokens): void {
    // Collect colors
    if (node.fills) {
      node.fills.forEach(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = this.rgbaToHex(fill.color);
          tokens.colors[`fill-${hex}`] = hex;
        }
      });
    }

    // Collect spacing
    if (node.itemSpacing) tokens.spacing.push(node.itemSpacing);
    if (node.paddingTop) tokens.spacing.push(node.paddingTop);
    if (node.paddingRight) tokens.spacing.push(node.paddingRight);
    if (node.paddingBottom) tokens.spacing.push(node.paddingBottom);
    if (node.paddingLeft) tokens.spacing.push(node.paddingLeft);

    // Collect font sizes
    if (node.style?.fontSize) tokens.fontSizes.push(node.style.fontSize);

    // Collect border radii
    if (node.cornerRadius) tokens.borderRadii.push(node.cornerRadius);

    // Collect shadows
    if (node.effects) {
      node.effects.forEach(effect => {
        if (effect.type === 'DROP_SHADOW' && effect.visible !== false && effect.offset && effect.color) {
          const shadow = `${effect.offset.x}px ${effect.offset.y}px ${effect.radius || 0}px ${this.rgbaToHex(effect.color)}`;
          tokens.shadows.push(shadow);
        }
      });
    }

    // Recurse
    if (node.children) {
      node.children.forEach(child => this.collectTokens(child, tokens));
    }
  }

  private analyzeMetadata(node: FigmaNodeComplete): ExtractedDesignData['metadata'] {
    let totalComponents = 0;
    let hasInteractiveElements = false;
    let hasImages = false;
    let hasText = false;

    const analyze = (n: FigmaNodeComplete) => {
      totalComponents++;

      if (n.type === 'TEXT') hasText = true;
      if (n.fills?.some(f => f.type === 'IMAGE')) hasImages = true;
      if (n.name.toLowerCase().includes('button') || n.name.toLowerCase().includes('input')) {
        hasInteractiveElements = true;
      }

      if (n.children) {
        n.children.forEach(analyze);
      }
    };

    analyze(node);

    const complexity =
      totalComponents > 20 ? 'complex' :
      totalComponents > 10 ? 'moderate' : 'simple';

    return {
      totalComponents,
      hasInteractiveElements,
      hasImages,
      hasText,
      complexity,
    };
  }

  private rgbaToHex(color: { r: number; g: number; b: number; a: number }): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);

    if (color.a < 1) {
      const a = Math.round(color.a * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
    }

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
