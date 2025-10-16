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
      "args": ["/absolute/path/to/your-react-project/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "YOUR_FIGMA_TOKEN",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanlreW92Z3dmYXh5aXJ0eXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODgwOTMsImV4cCI6MjA3NjA2NDA5M30.2QD9G1QKU4LX8IwUIssn8K0-BCWhfgTbEabVzV36Los",
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_KEY",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System"
      }
    }
  }
}
```

**What to replace:**
- `YOUR_ANTHROPIC_API_KEY` - Your Anthropic API key (get from https://console.anthropic.com)
- `YOUR_FIGMA_TOKEN` - Your Figma access token
- `/absolute/path/to/your-react-project/` - Full path to YOUR project (see "Where Should MCP Server Live?" below)

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

---

## Where Should MCP Server Live?

**IMPORTANT:** The MCP server should live in **your actual React project**, not in this test/setup repository.

### Recommended Structure

```
your-react-project/
├── src/
│   └── components/          ← Your React components
├── package.json
├── .env
└── mcp-server/              ← Add the MCP server here
    ├── dist/
    │   └── index.js        ← Built MCP server
    ├── src/
    │   ├── index.ts
    │   ├── services/
    │   └── tools/
    ├── package.json
    └── tsconfig.json
```

### How to Move It to Your Project

1. **Copy the `mcp-server` folder** to your actual React project:
   ```bash
   cp -r /path/to/this-repo/mcp-server ~/your-react-project/
   ```

2. **Build it once** (in your project):
   ```bash
   cd ~/your-react-project/mcp-server
   npm install
   npm run build
   ```

3. **Update VS Code Continue config** to point to your project:
   ```json
   {
     "mcpServers": {
       "lumiere-figma": {
         "command": "node",
         "args": ["/Users/you/your-react-project/mcp-server/dist/index.js"],
         "env": { ... }
       }
     }
   }
   ```

### Why This Structure?

- **Co-located**: MCP server lives with the code it generates
- **Version controlled**: Part of your project's git repo
- **Easy access**: Can reference your project's components
- **Self-contained**: Each project can have its own MCP configuration
- **Team sharing**: Other developers can use the same setup

**Note:** This current repository is just for testing and setup. Once you verify it works, move the `mcp-server` folder to your real project!

---

## Troubleshooting

### Database Connection Failed

If you see database errors, the Supabase key may be outdated. Update it in:
- Continue config (`config.json`)
- Test script (`test-mcp-standalone.js`)
- Environment file (`.env`)

The current key is already in the config above and expires in 2076.

### MCP Server Not Found

Make sure:
1. You've built the MCP server (`npm run build` in `mcp-server/`)
2. The path in `config.json` points to the correct location
3. You've restarted VS Code after config changes

### Figma API Errors

Verify your Figma access token:
1. Go to https://www.figma.com/developers/api#access-tokens
2. Generate a new personal access token
3. Update it in Continue config

### Commands Not Showing Up

In Continue chat, type `@` to see available MCP tools:
- `analyze_figma` - Analyze Figma designs
- `scan_lumiere` - Scan component library
- `generate_react` - Generate React components
- `get_component` - Get specific component info
- `generate_implementation_guide` - Generate implementation guides
