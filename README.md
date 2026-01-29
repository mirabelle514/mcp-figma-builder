# Component MCP Server

An MCP (Model Context Protocol) server that speed up the connection between Figma designs to React components **using YOUR actual component library**. Works with Claude Desktop, VS Code Continue, and other MCP-compatible AI tools.

##  NEW: Visual Setup Wizard.

**No config file editing needed!** Just run `npm run dev` and follow the interactive setup wizard at `http://localhost:5173`

-  Step-by-step guidance
-  Real-time validation
-  Auto-generate Claude Desktop config
-  Beautiful, modern interface

**Get started in 5 minutes!** See [Quick Start](#-quick-start-two-options) below.

##  Key Feature: Uses Your Actual Components!

Unlike generic tools that generate Tailwind CSS, this tool generates code that **imports and uses your actual design system components** (Material-UI, Ant Design, or your custom library).

## Features

### Four Powerful Modes

1. **Mode 1 - Component Mapping Only**: Free - Matches Figma to your component library (no AI)
2. **Mode 2 - AI with Anthropic Claude**: Generates code using your components with Claude 3.5 Sonnet
3. **Mode 3 - AI with OpenAI GPT-4**: Generates code using your components with GPT-4o
4. **Mode 4 - Custom AI Provider**: Connect your internal AI (e.g., Azure OpenAI, self-hosted LLMs)

### What It Does

- Scans YOUR component library repository (Material-UI, Ant Design, or your custom design system)
- Analyzes complete Figma designs (layouts, styles, colors, typography)
- **Matches Figma elements to your actual components** (Button → Button, Input → FieldText)
- **Generates code using your component library imports** (not generic HTML/Tailwind)
- Extracts design tokens (colors, spacing, fonts, shadows)
- Stores generation history in Supabase
- Provides component usage examples and documentation

### Example Output

**What you get:**
```tsx
import { Button, FieldText, Form } from '@design-system/components';
// Uses YOUR actual components
```

**NOT generic code:**
```tsx
//  NOT this:
<button className="px-4 py-2 bg-blue-500">Click</button>

//  But this:
<Button fill color="primary">Click</Button>
```

##  Quick Start (Two Options)

### Option 1: Visual Setup Wizard (Recommended for First Time)

**1. Clone and start the setup wizard:**
```bash
git clone <your-repo-url>
cd <project-directory>
npm install
npm run dev
```

**2. Open your browser:**
```
http://localhost:5173
```

**3. Follow the interactive setup wizard:**
- Choose your mode (No AI, Anthropic, or OpenAI)
- Configure your component repository
- Add API keys
- Generate Claude Desktop config
- Download and install

**That's it!** The wizard walks you through everything step-by-step.

---

### Option 2: Manual Configuration

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
    "component-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_optional",
        "REPO_OWNER": "your-org",
        "REPO_NAME": "design-system",
        "GITHUB_TOKEN": "optional_github_token"
      }
    }
  }
}
```

** Using Your Own Component Library?**

Change these two lines:
```json
"REPO_OWNER": "your-org",
"REPO_NAME": "your-design-system"
```

Examples:
- Material-UI: `"mui"` / `"material-ui"`
- Ant Design: `"ant-design"` / `"ant-design"`
- Your custom: `"your-company"` / `"your-repo"`

** See [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) for complete setup!**

### 4. Get API Keys

- **Figma Token**: https://www.figma.com/developers/api#access-tokens
- **Anthropic API Key**: https://console.anthropic.com/
- **Supabase Keys**: Already in your `.env` file

### 5. Restart Claude Desktop

### 6. Use It

**Generate a new React component (uses YOUR components!):**
```
User: Generate a React component from this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38

Claude: [Generates complete React component using your component library]
```

**Or match to existing components:**
```
User: Scan the repository, then analyze this design:
https://www.figma.com/design/ABC123/Design?node-id=4-38

Claude: [Matches design to existing components]
```

## Development Process

### Challenge
Build a tool that translates Figma designs into production-ready React code using a team's actual component library, not generic Tailwind CSS. The system needed to work with any component library (Material-UI, Ant Design, custom design systems) and support multiple AI providers.

### Technical Decisions

**Multi-Mode Architecture**
- Mode 1 (Component Mapping): Free matching without AI for teams exploring options
- Mode 2-3 (AI Generation): Anthropic Claude and OpenAI GPT-4 for flexibility
- Mode 4 (Custom AI): Enterprise support for internal AI tools and Azure OpenAI

**Component Scanning Strategy**
- GitHub API integration for reading component repositories without requiring local setup
- AST parsing to extract component props and TypeScript interfaces
- Confidence scoring algorithm for Figma-to-component matching

**Database Design**
- Supabase for storing generation history and component mappings
- Efficient querying for real-time component lookups during AI generation
- Version tracking for component library changes

**Interactive Setup Wizard**
- React-based configuration UI instead of manual JSON editing
- Real-time validation and error handling
- Auto-generation of Claude Desktop configuration files

### My Contribution

**What I Built:**
- Designed the four-mode architecture supporting different AI providers and use cases
- Implemented the GitHub repository scanner with TypeScript AST analysis
- Created the component matching algorithm with confidence scoring
- Built the interactive setup wizard for zero-config onboarding
- Designed the MCP server protocol implementation for Claude Desktop integration
- Implemented Supabase schema and data models

**AI-Assisted Development:**
- Used Claude to accelerate TypeScript interface definitions for MCP protocol
- Iterated on AI-generated regex patterns for component prop extraction
- Refined error handling and validation logic with AI suggestions
- Debugged complex async flows in the GitHub API integration

**Skills Demonstrated:**
- Model Context Protocol (MCP) implementation
- Abstract Syntax Tree (AST) parsing and code analysis
- Multi-provider AI integration architecture
- GitHub API usage and repository scanning
- Real-time configuration UI design
- Database schema design for version tracking

### Real-World Application

This tool demonstrates:
- Understanding of design-to-code workflow challenges
- Ability to integrate multiple AI providers with fallback strategies
- Practical knowledge of component library structures
- Production-ready error handling and validation

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
- **Uses your actual component library** (Material-UI, Ant Design, etc.)
- TypeScript interfaces
- Proper component imports from your design system
- Design tokens
- Usage examples

### `scan_repository`
Scan design system repository and load components into database.

### `analyze_figma_design`
Analyze Figma design and match to existing components.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `generate_implementation_guide`
Generate implementation guide using design system components.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `get_component_details`
Get details about a specific component.

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
- **Anthropic Claude** or **OpenAI GPT-4**: AI code generation
- **Supabase**: Database storage
- **TypeScript**: Type-safe development
- **Your Component Library**: Material-UI, Ant Design, or custom

## Database Schema

### Tables Created

1. **figma_designs**: Stores Figma design data
2. **generated_components**: Stores generated React components
3. **generation_history**: Tracks all generation requests
4. **components**: Design system components
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

When you generate a component, you get code that **uses your actual component library**:

```tsx
import React, { useState } from 'react';
import {
  Form,
  FormRow,
  FieldText,
  FieldPassword,
  Button,
  Panel,
  Title,
  Spacer
} from '@design-system/components';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email, password);
  };

  return (
    <Panel style={{ maxWidth: 400 }}>
      <Title size="l">
        <h2>Welcome Back</h2>
      </Title>

      <Spacer size="l" />

      <Form component="form" onSubmit={handleSubmit}>
        <FormRow label="Email">
          <FieldText
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="email"
          />
        </FormRow>

        <FormRow label="Password">
          <FieldPassword
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormRow>

        <Spacer size="l" />

        <Button type="submit" fill fullWidth>
          Sign In
        </Button>
      </Form>
    </Panel>
  );
}
```

**Notice:** It uses `Button`, `FieldText`, etc. from your component library instead of generic HTML elements!

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
    "component-mcp-server": {
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
