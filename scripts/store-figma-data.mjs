import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL_HERE',
  'YOUR_SUPABASE_ANON_KEY_HERE'
);

async function storeFigmaData() {
  console.log('Storing Figma file metadata...');

  // Store prompt categories
  const categories = [
    {
      category_id: 'component-structure',
      name: 'Component Structure',
      description: 'Architectural patterns and code organization',
      file_name: 'component-structure.json',
      prompt_count: 8
    },
    {
      category_id: 'styling-design',
      name: 'Styling & Design',
      description: 'Visual implementation and styling approaches',
      file_name: 'styling-design.json',
      prompt_count: 10
    },
    {
      category_id: 'behavior-interaction',
      name: 'Behavior & Interaction',
      description: 'Component functionality and user interactions',
      file_name: 'behavior-interaction.json',
      prompt_count: 12
    },
    {
      category_id: 'accessibility',
      name: 'Accessibility',
      description: 'WCAG compliance and inclusive design',
      file_name: 'accessibility.json',
      prompt_count: 14
    },
    {
      category_id: 'performance',
      name: 'Performance',
      description: 'Optimization and efficient rendering',
      file_name: 'performance.json',
      prompt_count: 12
    },
    {
      category_id: 'testing',
      name: 'Testing',
      description: 'Test coverage and quality assurance',
      file_name: 'testing.json',
      prompt_count: 12
    }
  ];

  for (const category of categories) {
    const { data, error } = await supabase
      .from('prompt_categories')
      .upsert(category, { onConflict: 'category_id' })
      .select();

    if (error) {
      console.error(`Error storing category ${category.name}:`, error);
    } else {
      console.log(`✓ Stored category: ${category.name}`);
    }
  }

  // Store sample prompts from component-structure
  const prompts = [
    {
      prompt_id: 'typescript-strict',
      name: 'TypeScript Strict Mode',
      category: 'component-structure',
      content: 'Generate the component using TypeScript with strict type checking enabled. Define explicit types for all props, state, and function returns. Use interfaces for complex prop types. Avoid using \'any\' type. Export all type definitions for reusability.',
      tags: ['typescript', 'types', 'strict'],
      recommended_for: ['forms', 'data-tables', 'complex-components']
    },
    {
      prompt_id: 'tailwind-utility-first',
      name: 'Tailwind CSS Utility Classes',
      category: 'styling-design',
      content: 'Use Tailwind CSS utility classes for all styling. Follow utility-first principles. Use arbitrary values sparingly. Group related utilities (layout, spacing, colors, typography). Extract repeated patterns into custom classes or components when needed.',
      tags: ['tailwind', 'css', 'utility-first'],
      recommended_for: ['all-components']
    },
    {
      prompt_id: 'responsive-mobile-first',
      name: 'Responsive Mobile-First Design',
      category: 'styling-design',
      content: 'Implement responsive design using a mobile-first approach. Start with mobile layout and progressively enhance for larger screens. Use Tailwind breakpoints (sm:, md:, lg:, xl:, 2xl:) or media queries. Test on multiple viewport sizes. Ensure touch-friendly targets on mobile.',
      tags: ['responsive', 'mobile', 'breakpoints'],
      recommended_for: ['layouts', 'pages', 'navigation']
    },
    {
      prompt_id: 'aria-compliant',
      name: 'ARIA Labels and Roles',
      category: 'accessibility',
      content: 'Add appropriate ARIA attributes for screen readers. Use aria-label or aria-labelledby for interactive elements. Set correct ARIA roles (button, dialog, navigation, etc.). Include aria-describedby for additional context. Use aria-live for dynamic content updates.',
      tags: ['aria', 'screen-readers', 'wcag'],
      recommended_for: ['all-components']
    },
    {
      prompt_id: 'functional-hooks',
      name: 'Functional Components with Hooks',
      category: 'component-structure',
      content: 'Use functional components exclusively with React hooks (useState, useEffect, useCallback, useMemo). Organize hooks logically at the top of the component. Extract custom hooks for reusable logic. Follow the Rules of Hooks.',
      tags: ['hooks', 'functional', 'modern-react'],
      recommended_for: ['all-components']
    }
  ];

  for (const prompt of prompts) {
    const { data, error } = await supabase
      .from('prompt_templates')
      .upsert(prompt, { onConflict: 'prompt_id' })
      .select();

    if (error) {
      console.error(`Error storing prompt ${prompt.name}:`, error);
    } else {
      console.log(`✓ Stored prompt: ${prompt.name}`);
    }
  }

  console.log('\n✅ Figma metadata and prompts stored successfully!');
}

storeFigmaData().catch(console.error);
