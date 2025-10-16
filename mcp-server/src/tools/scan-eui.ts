import { z } from 'zod';
import { EuiScanner } from '../services/eui-scanner.js';
import { DatabaseService } from '../services/db-service.js';

const ScanEuiInputSchema = z.object({});

export const scanEuiTool = {
  name: 'scan_eui_repository',
  description: 'Scan the EUI Design System repository and store all component metadata in the database. This should be run once to initialize the component library.',
  inputSchema: {
    type: 'object' as const,
    properties: {},
  },
};

export async function handleScanEui(
  _args: z.infer<typeof ScanEuiInputSchema>,
  env: { EUI_REPO_OWNER: string; EUI_REPO_NAME: string; GITHUB_TOKEN?: string; SUPABASE_URL: string; SUPABASE_ANON_KEY: string }
) {
  try {
    const scanner = new EuiScanner(
      env.EUI_REPO_OWNER,
      env.EUI_REPO_NAME,
      env.GITHUB_TOKEN
    );

    const components = await scanner.scanRepository();

    if (components.length === 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `No components found in the EUI repository at https://github.com/${env.EUI_REPO_OWNER}/${env.EUI_REPO_NAME}.

Please verify:
- The repository URL is correct
- The repository contains component files in standard locations (src/components, components, or lib/components)
- If the repository is private, ensure GITHUB_TOKEN is configured`,
          },
        ],
      };
    }

    const db = new DatabaseService(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    await db.storeEuiComponents(components);

    const componentList = components
      .map(c => `  - ${c.component_name} (${c.category})`)
      .join('\n');

    return {
      content: [
        {
          type: 'text' as const,
          text: `Successfully scanned EUI Design System repository!

Found and stored ${components.length} components:

${componentList}

Components by category:
${getCategorySummary(components)}

You can now analyze Figma designs and get implementation guides using these components.`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error scanning EUI repository: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}

function getCategorySummary(components: any[]): string {
  const categories = components.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categories)
    .map(([cat, count]) => `  - ${cat}: ${count}`)
    .join('\n');
}
