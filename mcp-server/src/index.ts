#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { scanLumiereTool, handleScanLumiere } from './tools/scan-lumiere.js';
import { analyzeFigmaTool, handleAnalyzeFigma } from './tools/analyze-figma.js';
import { generateGuideTool, handleGenerateGuide } from './tools/generate-guide.js';
import { getComponentTool, handleGetComponent } from './tools/get-component.js';

interface Environment {
  FIGMA_ACCESS_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  LUMIERE_REPO_OWNER: string;
  LUMIERE_REPO_NAME: string;
  GITHUB_TOKEN?: string;
}

function getEnv(): Environment {
  const required = [
    'FIGMA_ACCESS_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'LUMIERE_REPO_OWNER',
    'LUMIERE_REPO_NAME',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    LUMIERE_REPO_OWNER: process.env.LUMIERE_REPO_OWNER!,
    LUMIERE_REPO_NAME: process.env.LUMIERE_REPO_NAME!,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };
}

const server = new Server(
  {
    name: 'lumiere-figma-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  scanLumiereTool as Tool,
  analyzeFigmaTool as Tool,
  generateGuideTool as Tool,
  getComponentTool as Tool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const env = getEnv();

  try {
    switch (request.params.name) {
      case 'scan_lumiere_repository':
        return await handleScanLumiere(request.params.arguments || {}, env);

      case 'analyze_figma_design':
        return await handleAnalyzeFigma(request.params.arguments as any, env);

      case 'generate_implementation_guide':
        return await handleGenerateGuide(request.params.arguments as any, env);

      case 'get_component_details':
        return await handleGetComponent(request.params.arguments as any, env);

      default:
        return {
          content: [
            {
              type: 'text' as const,
              text: `Unknown tool: ${request.params.name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  try {
    const env = getEnv();
    console.error('Lumiere-Figma MCP Server starting...');
    console.error(`Configured for repository: ${env.LUMIERE_REPO_OWNER}/${env.LUMIERE_REPO_NAME}`);
    console.error(`Using Supabase at: ${env.SUPABASE_URL}`);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Lumiere-Figma MCP Server running on stdio');
    console.error('\nAvailable tools:');
    console.error('  - scan_lumiere_repository: Scan and load Lumiere components');
    console.error('  - analyze_figma_design: Analyze Figma design and match components');
    console.error('  - generate_implementation_guide: Generate complete implementation guide');
    console.error('  - get_component_details: Get details about a specific component');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
