# Component Library to Figma MCP Server

MCP server that helps developers implement Figma designs using their **actual component library**. It offers two powerful approaches:

1. **Component Mapping**: Matches Figma designs to your existing component library (EUI, Material-UI, your custom design system, etc.)
2. **AI Code Generation**: Generates React components using your **actual component library components** (not generic Tailwind)

** Works with ANY component library!** Default is Elastic EUI, but easily configurable for your own repo.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Configure Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "component-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_figma_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui",
        "GITHUB_TOKEN": "your_github_token_optional",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_optional"
      }
    }
  }
}
```

** Using Your Own Component Library?**

Change these two lines to point to YOUR repository:
```json
"LUMIERE_REPO_OWNER": "your-company",
"LUMIERE_REPO_NAME": "your-design-system"
```

**Examples:**
- Material-UI: `"mui"` / `"material-ui"`
- Ant Design: `"ant-design"` / `"ant-design"`
- Your custom: `"your-org"` / `"your-repo"`

** See [`docs/CONFIGURATION.md`](../docs/CONFIGURATION.md) for complete configuration guide!**

### 4. Restart Claude Desktop

### 5. Use in Claude

**Approach 1: Match to Existing Components**
```
User: Scan the Lumiere Design System repository

Claude: [Scans repo, finds components]

User: Help me implement this Figma design:
https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/MB-test?node-id=4-38

Claude: [Provides implementation guide with existing Lumiere components]
```

**Approach 2: Generate New React Component** (Uses Your Actual Components!)
```
User: Generate a React component from this Figma design:
https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/MB-test?node-id=4-38

Claude: [Uses AI to generate complete React component using EUI/your component library]
```

**The AI generates code that imports and uses YOUR actual components:**
```tsx
import { EuiButton, EuiFieldText, EuiForm } from '@elastic/eui';
// NOT: <button className="px-4 py-2 bg-blue-500">
// BUT: <EuiButton fill color="primary">
```

## Available Tools

### `scan_lumiere_repository`
Scans the Lumiere repository and loads all components into the database.

**Usage:** Run once to initialize.

### `analyze_figma_design`
Analyzes a Figma design and matches it to Lumiere components.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `generate_implementation_guide`
Generates complete implementation guide with code examples.

**Parameters:**
- `figmaUrl`: Full Figma URL

### `get_component_details`
Get details about a specific Lumiere component.

**Parameters:**
- `componentName`: Name of component (e.g., "Button")

### `generate_react_from_figma` (NEW)
Generates a complete React component from a Figma design using AI.

**Parameters:**
- `figmaUrl`: Full Figma URL (required)
- `componentName`: Custom component name (optional)
- `includeTypeScript`: Generate TypeScript code (optional, default: true)
- `includeComments`: Include code comments (optional, default: false)

**Features:**
- Extracts complete layout, styles, and design tokens from Figma
- Converts Figma auto-layout to Flexbox/Grid with Tailwind CSS
- Generates production-ready React components
- Uses Claude AI for intelligent code generation
- Stores generation history in Supabase
- Provides component usage examples

**Example:**
```
User: generate_react_from_figma with figmaUrl="https://www.figma.com/design/ABC/Design?node-id=4-38"

Output:
- Complete React component code
- TypeScript interfaces
- Tailwind CSS classes
- Required dependencies
- Usage examples
```

## Environment Variables

### Required
- `FIGMA_ACCESS_TOKEN`: Your Figma personal access token
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `LUMIERE_REPO_OWNER`: GitHub organization/user (e.g., "mirabelle514")
- `LUMIERE_REPO_NAME`: GitHub repository name (e.g., "Lumiere-Design-System")

### Optional
- `GITHUB_TOKEN`: GitHub token for private repos
- `ANTHROPIC_API_KEY`: Anthropic API key (required for `generate_react_from_figma` tool)

## Development

```bash
# Watch mode
npm run watch

# Build
npm run build

# Start
npm start
```

## Troubleshooting

### "Missing required environment variables"
Ensure all required env vars are set in Claude Desktop config.

### "No components found"
- Verify repository name and owner
- Check if repo is private (needs GITHUB_TOKEN)
- Ensure components are in standard locations

### "Figma API error"
- Verify FIGMA_ACCESS_TOKEN is valid
- Check Figma URL is correct
- Ensure you have access to the Figma file

### "ANTHROPIC_API_KEY is required"
- Add your Anthropic API key to the MCP server config
- Get an API key from: https://console.anthropic.com/
- The key is only needed for the `generate_react_from_figma` tool

## License

MIT
