// Converts Figma properties to Tailwind CSS classes

import { LayoutInfo, StyleInfo } from './figma-extractor.js';

export class TailwindConverter {
  convertLayout(layout: LayoutInfo): string[] {
    const classes: string[] = [];

    // Display
    if (layout.display === 'flex') {
      classes.push('flex');

      // Direction
      if (layout.direction === 'column') {
        classes.push('flex-col');
      } else {
        classes.push('flex-row');
      }

      // Justify content
      if (layout.justifyContent) {
        const justifyMap: Record<string, string> = {
          'center': 'justify-center',
          'flex-start': 'justify-start',
          'flex-end': 'justify-end',
          'space-between': 'justify-between',
          'space-around': 'justify-around',
        };
        if (justifyMap[layout.justifyContent]) {
          classes.push(justifyMap[layout.justifyContent]);
        }
      }

      // Align items
      if (layout.alignItems) {
        const alignMap: Record<string, string> = {
          'center': 'items-center',
          'flex-start': 'items-start',
          'flex-end': 'items-end',
          'stretch': 'items-stretch',
        };
        if (alignMap[layout.alignItems]) {
          classes.push(alignMap[layout.alignItems]);
        }
      }

      // Gap
      if (layout.gap !== undefined) {
        const gapClass = this.spacingToTailwind(layout.gap, 'gap');
        if (gapClass) classes.push(gapClass);
      }

      // Wrap
      if (layout.wrap) {
        classes.push('flex-wrap');
      }
    }

    // Padding
    if (layout.padding) {
      const { top, right, bottom, left } = layout.padding;

      if (top === right && right === bottom && bottom === left) {
        // Uniform padding
        const pClass = this.spacingToTailwind(top, 'p');
        if (pClass) classes.push(pClass);
      } else if (top === bottom && left === right) {
        // Vertical and horizontal
        const pyClass = this.spacingToTailwind(top, 'py');
        const pxClass = this.spacingToTailwind(left, 'px');
        if (pyClass) classes.push(pyClass);
        if (pxClass) classes.push(pxClass);
      } else {
        // Individual sides
        const ptClass = this.spacingToTailwind(top, 'pt');
        const prClass = this.spacingToTailwind(right, 'pr');
        const pbClass = this.spacingToTailwind(bottom, 'pb');
        const plClass = this.spacingToTailwind(left, 'pl');
        if (ptClass) classes.push(ptClass);
        if (prClass) classes.push(prClass);
        if (pbClass) classes.push(pbClass);
        if (plClass) classes.push(plClass);
      }
    }

    // Width
    if (layout.width === 'full') {
      classes.push('w-full');
    } else if (layout.width === 'auto') {
      classes.push('w-auto');
    } else if (typeof layout.width === 'number') {
      const wClass = this.sizeToTailwind(layout.width, 'w');
      if (wClass) classes.push(wClass);
    }

    // Height
    if (layout.height === 'full') {
      classes.push('h-full');
    } else if (layout.height === 'auto') {
      classes.push('h-auto');
    } else if (typeof layout.height === 'number') {
      const hClass = this.sizeToTailwind(layout.height, 'h');
      if (hClass) classes.push(hClass);
    }

    return classes;
  }

  convertStyles(styles: StyleInfo): string[] {
    const classes: string[] = [];

    // Background color
    if (styles.backgroundColor) {
      const bgClass = this.colorToTailwind(styles.backgroundColor, 'bg');
      if (bgClass) classes.push(bgClass);
    }

    // Text color
    if (styles.color) {
      const textClass = this.colorToTailwind(styles.color, 'text');
      if (textClass) classes.push(textClass);
    }

    // Font size
    if (styles.fontSize) {
      const textSizeClass = this.fontSizeToTailwind(styles.fontSize);
      if (textSizeClass) classes.push(textSizeClass);
    }

    // Font weight
    if (styles.fontWeight) {
      const fontWeightClass = this.fontWeightToTailwind(styles.fontWeight);
      if (fontWeightClass) classes.push(fontWeightClass);
    }

    // Border radius
    if (styles.borderRadius) {
      const roundedClass = this.borderRadiusToTailwind(styles.borderRadius);
      if (roundedClass) classes.push(roundedClass);
    }

    // Border
    if (styles.borderWidth) {
      const borderClass = this.borderWidthToTailwind(styles.borderWidth);
      if (borderClass) classes.push(borderClass);

      if (styles.borderColor) {
        const borderColorClass = this.colorToTailwind(styles.borderColor, 'border');
        if (borderColorClass) classes.push(borderColorClass);
      }
    }

    // Box shadow
    if (styles.boxShadow) {
      classes.push('shadow-lg');
    }

    // Opacity
    if (styles.opacity !== undefined && styles.opacity < 1) {
      const opacityClass = this.opacityToTailwind(styles.opacity);
      if (opacityClass) classes.push(opacityClass);
    }

    return classes;
  }

  private spacingToTailwind(value: number, prefix: string): string | null {
    // Tailwind spacing scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
    // Each unit = 0.25rem = 4px
    const px = value;
    const unit = Math.round(px / 4);

    if (unit === 0) return `${prefix}-0`;
    if (unit <= 6) return `${prefix}-${unit}`;
    if (unit <= 64) {
      const standardUnits = [8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64];
      const closest = standardUnits.reduce((prev, curr) =>
        Math.abs(curr - unit) < Math.abs(prev - unit) ? curr : prev
      );
      return `${prefix}-${closest}`;
    }

    return `${prefix}-[${px}px]`;
  }

  private sizeToTailwind(value: number, prefix: string): string | null {
    // Common widths/heights
    if (value === 0) return `${prefix}-0`;

    // Standard sizes (in px / 4)
    const standardSizes: Record<number, string> = {
      16: '4', 24: '6', 32: '8', 40: '10', 48: '12', 64: '16',
      80: '20', 96: '24', 128: '32', 160: '40', 192: '48', 256: '64',
      320: '80', 384: '96',
    };

    if (standardSizes[value]) {
      return `${prefix}-${standardSizes[value]}`;
    }

    // Use arbitrary value
    return `${prefix}-[${value}px]`;
  }

  private colorToTailwind(hex: string, prefix: string): string | null {
    // Common Tailwind colors
    const colorMap: Record<string, string> = {
      '#000000': 'black',
      '#ffffff': 'white',
      '#f3f4f6': 'gray-100',
      '#e5e7eb': 'gray-200',
      '#d1d5db': 'gray-300',
      '#9ca3af': 'gray-400',
      '#6b7280': 'gray-500',
      '#4b5563': 'gray-600',
      '#374151': 'gray-700',
      '#1f2937': 'gray-800',
      '#111827': 'gray-900',
      '#3b82f6': 'blue-500',
      '#2563eb': 'blue-600',
      '#1d4ed8': 'blue-700',
      '#ef4444': 'red-500',
      '#10b981': 'green-500',
      '#f59e0b': 'yellow-500',
    };

    const normalized = hex.toLowerCase().substring(0, 7);

    if (colorMap[normalized]) {
      return `${prefix}-${colorMap[normalized]}`;
    }

    // Use arbitrary value
    return `${prefix}-[${hex}]`;
  }

  private fontSizeToTailwind(size: number): string | null {
    // Tailwind font sizes
    if (size <= 12) return 'text-xs';
    if (size <= 14) return 'text-sm';
    if (size <= 16) return 'text-base';
    if (size <= 18) return 'text-lg';
    if (size <= 20) return 'text-xl';
    if (size <= 24) return 'text-2xl';
    if (size <= 30) return 'text-3xl';
    if (size <= 36) return 'text-4xl';
    if (size <= 48) return 'text-5xl';
    if (size <= 60) return 'text-6xl';

    return `text-[${size}px]`;
  }

  private fontWeightToTailwind(weight: number): string | null {
    if (weight <= 200) return 'font-extralight';
    if (weight <= 300) return 'font-light';
    if (weight <= 400) return 'font-normal';
    if (weight <= 500) return 'font-medium';
    if (weight <= 600) return 'font-semibold';
    if (weight <= 700) return 'font-bold';
    if (weight <= 800) return 'font-extrabold';
    return 'font-black';
  }

  private borderRadiusToTailwind(radius: number): string | null {
    if (radius === 0) return 'rounded-none';
    if (radius <= 2) return 'rounded-sm';
    if (radius <= 4) return 'rounded';
    if (radius <= 6) return 'rounded-md';
    if (radius <= 8) return 'rounded-lg';
    if (radius <= 12) return 'rounded-xl';
    if (radius <= 16) return 'rounded-2xl';
    if (radius >= 9999) return 'rounded-full';

    return `rounded-[${radius}px]`;
  }

  private borderWidthToTailwind(width: number): string | null {
    if (width === 0) return 'border-0';
    if (width <= 1) return 'border';
    if (width <= 2) return 'border-2';
    if (width <= 4) return 'border-4';
    if (width <= 8) return 'border-8';

    return `border-[${width}px]`;
  }

  private opacityToTailwind(opacity: number): string | null {
    const percent = Math.round(opacity * 100);

    if (percent === 0) return 'opacity-0';
    if (percent <= 5) return 'opacity-5';
    if (percent <= 10) return 'opacity-10';
    if (percent <= 25) return 'opacity-25';
    if (percent <= 50) return 'opacity-50';
    if (percent <= 75) return 'opacity-75';
    if (percent <= 90) return 'opacity-90';
    if (percent <= 95) return 'opacity-95';

    return 'opacity-100';
  }

  combineClasses(classes: string[]): string {
    return classes.join(' ');
  }
}
