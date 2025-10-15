# Lumiere-Figma MCP Server

MCP server that helps developers implement Figma designs using existing Lumiere Design System components.

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
    "lumiere-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_7RbUp8RekLpw_EcpuVstTA0CbvarFt4Udpeqg8d2",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_supabase_anon_key",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System",
        "GITHUB_TOKEN": "your_github_token_optional"
      }
    }
  }
}
```

### 4. Restart Claude Desktop

### 5. Use in Claude

```
User: Scan the Lumiere Design System repository

Claude: [Scans repo, finds components]

User: Help me implement this Figma design:
https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/MB-test?node-id=4-38

Claude: [Provides implementation guide with code]
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

## Environment Variables

- `FIGMA_ACCESS_TOKEN`: Your Figma personal access token
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `LUMIERE_REPO_OWNER`: GitHub organization/user (e.g., "mirabelle514")
- `LUMIERE_REPO_NAME`: GitHub repository name (e.g., "Lumiere-Design-System")
- `GITHUB_TOKEN`: (Optional) GitHub token for private repos

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

## License

MIT
