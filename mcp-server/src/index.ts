#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { scanEuiTool, handleScanEui } from './tools/scan-eui.js';
import { analyzeFigmaTool, handleAnalyzeFigma } from './tools/analyze-figma.js';
import { generateGuideTool, handleGenerateGuide } from './tools/generate-guide.js';
import { getComponentTool, handleGetComponent } from './tools/get-component.js';
import { generateReactTool, handleGenerateReact } from './tools/generate-react.js';

interface Environment {
  FIGMA_ACCESS_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  REPO_OWNER: string;
  REPO_NAME: string;
  GITHUB_TOKEN?: string;
  ANTHROPIC_API_KEY?: string;
}

function getEnv(): Environment {
  const required = [
    'FIGMA_ACCESS_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'REPO_OWNER',
    'REPO_NAME',
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    FIGMA_ACCESS_TOKEN: process.env.FIGMA_ACCESS_TOKEN!,
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
    REPO_OWNER: process.env.REPO_OWNER!,
    REPO_NAME: process.env.REPO_NAME!,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };
}

const server = new Server(
  {
    name: 'component-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  scanEuiTool as Tool,
  analyzeFigmaTool as Tool,
  generateGuideTool as Tool,
  getComponentTool as Tool,
  generateReactTool as Tool,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const env = getEnv();

  try {
    switch (request.params.name) {
      case 'scan_repository':
        return await handleScanEui(request.params.arguments || {}, env);

      case 'analyze_figma_design':
        return await handleAnalyzeFigma(request.params.arguments as any, env);

      case 'generate_implementation_guide':
        return await handleGenerateGuide(request.params.arguments as any, env);

      case 'get_component_details':
        return await handleGetComponent(request.params.arguments as any, env);

      case 'generate_react_from_figma':
        return await handleGenerateReact(request.params.arguments as any, env);

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
    console.error('Component MCP Server starting...');
    console.error(`Configured for repository: ${env.REPO_OWNER}/${env.REPO_NAME}`);
    console.error(`Using Supabase at: ${env.SUPABASE_URL}`);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error('Component MCP Server running on stdio');
    console.error('\nAvailable tools:');
    console.error('  - scan_repository: Scan and load components');
    console.error('  - analyze_figma_design: Analyze Figma design and match components');
    console.error('  - generate_implementation_guide: Generate complete implementation guide');
    console.error('  - get_component_details: Get details about a specific component');
    console.error('  - generate_react_from_figma: Generate React component from Figma design (NEW)');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
