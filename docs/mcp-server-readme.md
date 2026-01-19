# Figma-to-Lumiere Implementation Guide MCP Server

A Model Context Protocol (MCP) server that helps developers implement Figma designs using existing design system components.

## Table of Contents

- [Overview](#overview)
- [What This Does](#what-this-does)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [MCP Tools Reference](#mcp-tools-reference)
- [Database Schema](#database-schema)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

This MCP server bridges the gap between Figma designs and your existing design system components. Instead of generating new components from scratch, it:

1. **Analyzes Figma designs** to understand visual patterns and structure
2. **Maps designs to existing components** with confidence scores
3. **Generates implementation guides** with code examples using your components
4. **Provides fast customization prompts** to help developers adapt the components

## What This Does

### Traditional Workflow (BEFORE)
```
Designer creates Figma mockup
    ↓
Developer manually inspects design
    ↓
Developer guesses which components to use
    ↓
Developer writes implementation from scratch
    ↓
Back-and-forth with designer on discrepancies
```

### New Workflow (WITH THIS MCP SERVER)
```
Designer creates Figma mockup
    ↓
Developer pastes Figma URL into Claude Desktop
    ↓
MCP server instantly shows:
  - "Use Lumiere Hero component"
  - "Use Lumiere Button (primary variant)"
  - "Use Lumiere Navbar"
    ↓
Developer gets ready-to-use code:
  <Hero title="..." subtitle="...">
    <Button variant="primary">Our projects</Button>
  </Hero>
    ↓
Developer customizes with fast prompts:
  - "Change the background color to #afd4e2"
  - "Add a second button with secondary style"
  - "Make it responsive for mobile"
```

## Architecture

```
┌─────────────────┐
│  Claude Desktop │ ← Developer pastes Figma URL
│   or AI Client  │
└────────┬────────┘
         │ MCP Protocol
┌────────▼───────────────────────────┐
│  Figma-Lumiere MCP Server          │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  1. Lumiere Scanner           │ │
│  │     Scans GitHub repo for     │ │
│  │     available components      │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  2. Figma Matcher             │ │
│  │     Analyzes Figma design     │ │
│  │     Matches to Lumiere comps  │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │  3. Implementation Generator  │ │
│  │     Creates usage guide with  │ │
│  │     code examples             │ │
│  └───────────────────────────────┘ │
└─────────────┬─────────────┬────────┘
              │             │
      ┌───────▼─────┐   ┌──▼──────────────┐
      │   Figma     │   │   Supabase      │
      │   API       │   │   Database      │
      │             │   │ (component maps)│
      └─────────────┘   └─────────────────┘
              │
      ┌───────▼─────────────────────┐
      │  Design System          │
      │  GitHub Repository          │
      │  (existing components)      │
      └─────────────────────────────┘
```

## Prerequisites

- **Node.js**: v18 or higher
- **Figma API Token**: Personal access token from Figma
- **Supabase Account**: For component mapping storage (provided)
- **MCP-Compatible Client**: Claude Desktop or other MCP clients
- **Design System**: Access to the GitHub repository

## Installation

### 1. Create MCP Server Project

```bash
mkdir lumiere-figma-mcp-server
cd lumiere-figma-mcp-server

npm init -y

npm install @modelcontextprotocol/sdk zod
npm install -D @types/node typescript

npm install @supabase/supabase-js
```

### 2. Project Structure

```
lumiere-figma-mcp-server/
├── src/
│   ├── index.ts                        # MCP server entry
│   ├── tools/
│   │   ├── scan-lumiere.ts            # Tool: Scan Lumiere repo
│   │   ├── analyze-figma.ts           # Tool: Analyze Figma design
│   │   ├── generate-guide.ts          # Tool: Generate implementation guide
│   │   └── quick-customize.ts         # Tool: Fast customization prompts
│   ├── services/
│   │   ├── lumiere-scanner.ts         # Lumiere repo scanner
│   │   ├── figma-matcher.ts           # Figma-to-Lumiere matcher
│   │   ├── implementation-generator.ts # Guide generator
│   │   └── db-service.ts              # Database service
│   └── types/
│       └── index.ts                   # TypeScript definitions
├── package.json
├── tsconfig.json
└── README.md
```

### 3. Copy Service Files

Copy these service files from the project:
- `src/services/lumiere-scanner.ts` - Scans Lumiere repo
- `src/services/figma-matcher.ts` - Matches Figma to components
- `src/services/implementation-generator.ts` - Generates guides

## Configuration

### 1. Environment Variables

Create `.env`:

```bash
# Figma API
FIGMA_ACCESS_TOKEN=figd_7RbUp8RekLpw_EcpuVstTA0CbvarFt4Udpeqg8d2

# Supabase (from your project)
SUPABASE_URL=https://oejykyovgwfaxyirtyxv.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Design System Repository
REPO_OWNER=mirabelle514
REPO_NAME=Lumiere-Design-System
GITHUB_TOKEN=your_github_token_for_private_repos (optional)
```

### 2. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/path/to/lumiere-figma-mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_7RbUp8RekLpw_EcpuVstTA0CbvarFt4Udpeqg8d2",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_key",
        "REPO_OWNER": "mirabelle514",
        "REPO_NAME": "Lumiere-Design-System"
      }
    }
  }
}
```

## Usage

### Step 1: Initialize Component Library

First time setup - scan the Lumiere repository:

```
In Claude Desktop:
"Scan the design system repository and load all available components"
```

This will:
- Fetch all component files from GitHub
- Extract component metadata (props, variants, patterns)
- Store in Supabase for fast lookups

### Step 2: Implement a Figma Design

Provide a Figma URL:

```
"Help me implement this Figma design:
https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/MB-test?node-id=4-38"
```

**MCP Server Response:**

```markdown
# Implementation Guide

## Matched Components

Found 3 components that match your design:

### Hero Component (95% match)
- Figma node: "Hero Section"
- Patterns: large-header, banner, featured-section

### Button Component (92% match)
- Figma node: "Primary Button"
- Patterns: clickable, call-to-action

### Button Component (88% match)
- Figma node: "Secondary Button"
- Patterns: clickable, call-to-action

## Implementation Code

```tsx
import { Hero, Button } from '@lumiere/components';

export default function LandingHero() {
  return (
    <Hero
      title="A home is built with love and dreams"
      subtitle="Real estate farm that makes your dreams true"
      background="#afd4e2"
    >
      <Button variant="primary">Our projects</Button>
      <Button variant="secondary">Contact us</Button>
    </Hero>
  );
}
```

## Design Tokens Detected

- **Background**: #afd4e2
- **Title font-size**: 48px
- **Spacing**: 24px gap between buttons

## Quick Customization Prompts

- Do you want to customize the colors?
- Should this be responsive? (mobile, tablet, desktop)
- What should happen when buttons are clicked?
```

### Step 3: Fast Customization

Use follow-up prompts:

```
"Make it responsive for mobile"
"Change the background to a gradient"
"Add a third button that links to /contact"
```

## How It Works

### 1. Component Scanning (Initial Setup)

```typescript
// LumiereScanner scans GitHub repo
const scanner = new LumiereScanner(githubToken);
const components = await scanner.scanRepository();

// Stores in database:
{
  component_name: "Button",
  component_path: "@lumiere/components/Button",
  props: { variant: "primary | secondary", children: "ReactNode" },
  visual_patterns: ["clickable", "call-to-action"],
  figma_keywords: ["button", "btn", "cta"]
}
```

### 2. Figma Analysis

```typescript
// FigmaMatcher analyzes Figma design
const matcher = new FigmaMatcher();
await matcher.loadComponentMappings(lumiereComponents);

const matches = await matcher.matchDesign(figmaNode);

// Returns matches with confidence scores:
[
  {
    component_name: "Hero",
    confidence: 0.95,
    matched_patterns: ["large-header", "banner"],
    suggested_props: { title: "...", subtitle: "..." }
  }
]
```

### 3. Implementation Guide Generation

```typescript
// ImplementationGenerator creates usage guide
const generator = new ImplementationGenerator();
const guide = generator.generateGuide(matches, figmaData);

// Returns:
{
  overview: "Use these 3 components...",
  imports: ["import { Hero, Button } from '@lumiere/components'"],
  full_code: "<Hero>...</Hero>",
  customization_notes: ["Add responsive classes", "Verify colors"],
  quick_prompts: [{ question: "Customize colors?", category: "styling" }]
}
```

## MCP Tools Reference

### `scan_repository`
Scans EUI Design System and stores component metadata.

**Parameters:** None

**Returns:** List of discovered components

### `analyze_figma_design`
Analyzes Figma design and matches to EUI components.

**Parameters:**
- `figmaUrl` (string): Full Figma URL with node-id

**Returns:** Array of component matches with confidence scores

### `generate_implementation_guide`
Generates implementation guide with code examples.

**Parameters:**
- `figmaUrl` (string): Figma URL
- `matches` (array): Component matches from analysis

**Returns:** Complete implementation guide (markdown)

### `customize_implementation`
Applies customization to generated implementation.

**Parameters:**
- `implementationCode` (string): Original code
- `customization` (string): Natural language customization request

**Returns:** Updated code with customizations applied

### `get_component_details`
Get detailed info about a EUI component.

**Parameters:**
- `componentName` (string): Name of EUI component

**Returns:** Component props, variants, usage examples

## Database Schema

See the migration file for complete schema:
- `lumiere_components` - Stores EUI component metadata
- `figma_component_mappings` - Maps Figma patterns to EUI components
- `implementation_guides` - Stores generated guides for users
- `implementation_prompts` - Fast customization prompts

## Development

### Building the MCP Server

```bash
# Build
npm run build

# Test
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

### Sample Tool Implementation

```typescript
// src/tools/analyze-figma.ts
export const analyzeFigmaTool = {
  name: 'analyze_figma_design',
  description: 'Analyze a Figma design and match to EUI components',
  inputSchema: {
    type: 'object',
    properties: {
      figmaUrl: {
        type: 'string',
        description: 'Full Figma URL with node-id'
      }
    },
    required: ['figmaUrl']
  },
  handler: async (args: any) => {
    // 1. Parse Figma URL
    const { fileKey, nodeId } = parseFigmaUrl(args.figmaUrl);

    // 2. Fetch Figma data
    const figmaData = await figmaService.getNode(fileKey, nodeId);

    // 3. Load EUI components from database
    const components = await dbService.getLumiereComponents();

    // 4. Match design to components
    const matcher = new FigmaMatcher();
    await matcher.loadComponentMappings(components);
    const matches = await matcher.matchDesign(figmaData);

    // 5. Return matches
    return { matches };
  }
};
```

## Troubleshooting

### "No components found in Lumiere repository"

**Solution:**
- Verify `REPO_OWNER` and `REPO_NAME` are correct
- Check if repo is private (need GitHub token)
- Ensure component files are in standard locations (src/components, components, lib/components)

### "Low confidence matches for Figma design"

**Solution:**
- Figma node naming affects matching - use descriptive names (e.g., "Hero Section", "Primary Button")
- The scanner learns patterns from your components - add more visual pattern keywords
- Manually update `figma_component_mappings` table for specific patterns

### "Generated code doesn't match Figma design exactly"

**Expected behavior!** This tool maps to **existing** components, not pixel-perfect generation. Use the customization prompts to refine:
- "Adjust the spacing to match Figma"
- "Change the font sizes"
- "Update the colors to match the design"

## Next Steps

1. **Scan your Lumiere repository** to build the component database
2. **Test with a simple design** (e.g., a button or card)
3. **Review generated guides** and provide feedback
4. **Customize mapping rules** based on your team's patterns
5. **Integrate into workflow** - use daily for Figma implementations

## Benefits

- **Speed**: 10x faster than manual Figma-to-code
- **Consistency**: Always uses your design system components
- **Learning**: Teaches developers which components to use
- **Maintainability**: Code uses proven, tested components
- **Accuracy**: High-confidence matches based on visual patterns

---

**Ready to implement designs faster? Let's go! **
