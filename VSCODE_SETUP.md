# Using with VS Code + Continue Extension

## Setup (5 minutes)

### 1. Install Continue Extension

1. Open VS Code
2. Go to Extensions (Cmd+Shift+X)
3. Search for "Continue"
4. Install "Continue - Codestral, Claude, and more"

### 2. Configure Continue

1. Open Command Palette (Cmd+Shift+P)
2. Type "Continue: Open config.json"
3. Add MCP server configuration:

```json
{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "apiKey": "YOUR_ANTHROPIC_API_KEY"
    }
  ],
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/tmp/cc-agent/58675574/project/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "YOUR_SUPABASE_KEY",
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_KEY",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System"
      }
    }
  }
}
```

### 3. Restart VS Code

### 4. Test

1. Open Continue chat (Cmd+L)
2. Type:
```
Generate a React component from this Figma design:
[YOUR FIGMA URL]
```

3. Continue will use the MCP tool to generate your component!

## Benefits

- ✅ Works exactly like Claude Desktop
- ✅ Integrated into your IDE
- ✅ Can insert code directly into files
- ✅ Full context of your project
- ✅ Free to use

## Usage

Once configured, you can:

```
// In Continue chat:

Generate a button component from this Figma:
https://www.figma.com/design/ABC/Design?node-id=1-2

// Continue will:
1. Call the MCP tool
2. Generate the React component
3. Show you the code
4. Let you insert it into your project
```

## Cost

- Continue extension: Free
- Anthropic API: ~$0.01-0.02 per generation
- MCP server: Free (runs locally)
