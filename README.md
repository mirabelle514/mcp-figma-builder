# Figma to React MCP Server

An MCP (Model Context Protocol) server that transforms Figma designs into production-ready React components. Works with Claude Desktop, VS Code Continue, and other MCP-compatible AI tools.

## Features

### Two Powerful Approaches

1. **Component Mapping**: Intelligently matches Figma designs to existing design system components
2. **AI Code Generation**: Generates brand-new React components from scratch using Claude AI

### What It Does

- Analyzes complete Figma designs (layouts, styles, colors, typography)
- Converts Figma auto-layout to Flexbox/Grid with Tailwind CSS
- Generates production-ready React components with TypeScript
- Extracts design tokens (colors, spacing, fonts, shadows)
- Stores generation history in Supabase
- Provides component usage examples and documentation

## Quick Start

### 1. Setup Supabase Database

Apply the migrations:
```bash
# Your Supabase database is already configured
# Migrations are in supabase/migrations/
```

### 2. Install and Build MCP Server

```bash
cd mcp-server
npm install
npm run build
```

### 3. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System",
        "GITHUB_TOKEN": "optional_github_token"
      }
    }
  }
}
```

### 4. Get API Keys

- **Figma Token**: https://www.figma.com/developers/api#access-tokens
- **Anthropic API Key**: https://console.anthropic.com/
- **Supabase Keys**: Already in your `.env` file

### 5. Restart Claude Desktop

### 6. Use It

**Generate a new React component:**
```
User: Generate a React component from this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38

Claude: [Generates complete React component with Tailwind CSS]
```

**Or match to existing components:**
```
User: Scan the Lumiere repository, then analyze this design:
https://www.figma.com/design/ABC123/Design?node-id=4-38

Claude: [Matches design to existing Lumiere components]
```

## Available MCP Tools

### `generate_react_from_figma`
Generate a complete React component from Figma design.

**Parameters:**
- `figmaUrl`: Full Figma URL (required)
- `componentName`: Custom component name (optional)
- `includeTypeScript`: Generate TypeScript (default: true)
- `includeComments`: Include comments (default: false)

**Output:**
- Complete React component code
- TypeScript interfaces
- Tailwind CSS classes
- Design tokens
- Usage examples

### `scan_lumiere_repository`
Scan Lumiere Design System and load components into database.

### `analyze_figma_design`
Analyze Figma design and match to existing Lumiere components.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `generate_implementation_guide`
Generate implementation guide using Lumiere components.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `get_component_details`
Get details about a specific Lumiere component.

**Parameters:**
- `componentName`: Component name

## Architecture

```
Figma Design
    ↓
Figma API (Extract complete data)
    ↓
FigmaExtractor (Analyze layout, styles, tokens)
    ↓
TailwindConverter (Convert to Tailwind classes)
    ↓
ReactGenerator (AI generates React code)
    ↓
Supabase (Store design + generated component)
    ↓
Output (Production-ready React component)
```

## Technology Stack

- **MCP SDK**: Model Context Protocol server
- **Figma API**: Design extraction
- **Anthropic Claude**: AI code generation
- **Supabase**: Database storage
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Generated styling

## Database Schema

### Tables Created

1. **figma_designs**: Stores Figma design data
2. **generated_components**: Stores generated React components
3. **generation_history**: Tracks all generation requests
4. **lumiere_components**: Lumiere Design System components
5. **figma_component_mappings**: Component matching rules

## Development

```bash
# MCP Server
cd mcp-server
npm run watch    # Watch mode
npm run build    # Build
npm start        # Start server

# Main Project
npm run dev      # Dev server
npm run build    # Build
```

## Example Output

When you generate a component, you get:

```tsx
import React from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <div className="flex flex-col gap-6 p-8 bg-white rounded-lg shadow-lg max-w-md">
      <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>

      <input
        type="email"
        placeholder="Email"
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Password"
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={() => onSubmit?.('', '')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign In
      </button>
    </div>
  );
}
```

## What Works Well

- Basic layouts (forms, cards, grids)
- Common components (buttons, inputs, navigation)
- Clean, maintainable code
- Fast iteration (generate → refine → regenerate)

## What Needs Refinement

- Complex animations
- Intricate custom designs
- Exact pixel-perfect spacing
- Interactive behaviors (you'll add these)

## Goal

**Turn 10 hours of implementation into 1-2 hours**

The tool generates 70-85% of the code. You refine the remaining 15-30%.

## Troubleshooting

### Missing API Key Errors
- Ensure all environment variables are set in Claude Desktop config
- Get Anthropic API key from https://console.anthropic.com/

### Figma API Errors
- Verify FIGMA_ACCESS_TOKEN is valid
- Check Figma URL format
- Ensure you have access to the Figma file

### Generation Failures
- Check that design isn't too complex (>50 elements)
- Simplify Figma design if needed
- Try generating specific frames/components instead of entire pages

## VS Code Continue Setup

Add to your Continue config:

```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        // Same env vars as Claude Desktop
      }
    }
  }
}
```

## License

MIT
