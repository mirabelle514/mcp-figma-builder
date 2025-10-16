# Setup Guide: Figma to React MCP Server

Complete setup instructions for getting your MCP server running.

## Prerequisites

- Node.js 18+ installed
- Figma account with API access
- Anthropic API key (for AI generation)
- Supabase project (already configured)
- Claude Desktop or VS Code with Continue extension

## Step-by-Step Setup

### 1. Get Your API Keys

#### Figma Access Token
1. Go to https://www.figma.com/
2. Click your profile picture → Settings
3. Scroll to "Personal Access Tokens"
4. Click "Create new token"
5. Copy the token (starts with `figd_`)

#### Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

#### Supabase Keys (Already Available)
- Check your `.env` file in the project root
- You'll need `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### 2. Apply Database Migrations

Your database migrations are already in `supabase/migrations/`:
- `20251015130358_create_prompts_library.sql`
- `20251015132648_redesign_for_component_mapping.sql`
- `20251016000000_add_react_generation.sql` (NEW)

These create the necessary tables for storing Figma designs and generated components.

### 3. Install MCP Server Dependencies

```bash
cd mcp-server
npm install
npm run build
```

This installs:
- `@anthropic-ai/sdk` - For AI code generation
- `@modelcontextprotocol/sdk` - MCP server framework
- `@supabase/supabase-js` - Database client
- `zod` - Schema validation

### 4. Configure Claude Desktop

**macOS Location:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows Location:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux Location:**
```
~/.config/Claude/claude_desktop_config.json
```

**Configuration:**
```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/REPLACE/WITH/ABSOLUTE/PATH/TO/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN_HERE",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY",
        "ANTHROPIC_API_KEY": "sk-ant-YOUR_KEY_HERE",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System",
        "GITHUB_TOKEN": ""
      }
    }
  }
}
```

**IMPORTANT:** Replace:
- `/REPLACE/WITH/ABSOLUTE/PATH/TO/` with your actual project path
- `figd_YOUR_TOKEN_HERE` with your Figma token
- `YOUR_SUPABASE_ANON_KEY` with your Supabase key
- `sk-ant-YOUR_KEY_HERE` with your Anthropic API key

### 5. Verify Installation

1. **Restart Claude Desktop** completely (quit and reopen)
2. Open a new conversation
3. Type: "What MCP tools do you have available?"
4. You should see:
   - `scan_lumiere_repository`
   - `analyze_figma_design`
   - `generate_implementation_guide`
   - `get_component_details`
   - `generate_react_from_figma` ⭐ NEW

### 6. Test the Generator

Try this in Claude Desktop:

```
Generate a React component from this Figma design:
https://www.figma.com/design/YOUR_FILE_ID/Design?node-id=YOUR_NODE_ID
```

Replace with your actual Figma URL. Claude will:
1. Extract the design from Figma
2. Analyze layout, styles, and design tokens
3. Generate React component code with Tailwind CSS
4. Provide usage examples
5. Store everything in Supabase

## VS Code Continue Setup

If you use VS Code with Continue extension:

1. Open VS Code Settings
2. Search for "Continue"
3. Edit `continue/config.json`
4. Add the same MCP server configuration

```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        // Same environment variables as Claude Desktop
      }
    }
  }
}
```

## Testing the Two Approaches

### Approach 1: Match to Existing Components

```
User: Scan the Lumiere Design System repository

Claude: [Scans and loads components]

User: Analyze this Figma design and match to Lumiere components:
https://www.figma.com/design/ABC/Design?node-id=1-2

Claude: [Provides matching Lumiere components with implementation guide]
```

### Approach 2: Generate New Components (AI)

```
User: Generate a React component from this Figma design:
https://www.figma.com/design/ABC/Design?node-id=1-2

Claude: [Generates complete React component with Tailwind CSS]
```

## Common Issues & Solutions

### "Tool not found" or "Unknown tool"
- **Solution**: Restart Claude Desktop completely
- Check that the path in config is absolute, not relative
- Verify the MCP server built successfully (`npm run build`)

### "ANTHROPIC_API_KEY is required"
- **Solution**: Add your Anthropic API key to the config
- Get one from https://console.anthropic.com/
- Restart Claude Desktop after adding

### "Figma API error: 403 Forbidden"
- **Solution**: Your Figma token is invalid or expired
- Generate a new token from Figma settings
- Ensure you have access to the Figma file

### "Failed to store in database"
- **Solution**: Check Supabase configuration
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Ensure migrations were applied

### Generation takes too long
- **Solution**: Try a simpler Figma design first
- Generate specific frames instead of entire pages
- Complex designs (>50 elements) take longer

## Architecture Overview

```
┌─────────────────┐
│  Figma Design   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Figma API     │ ← Extract complete design data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ FigmaExtractor  │ ← Analyze layout, styles, tokens
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│TailwindConverter│ ← Convert to Tailwind classes
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ReactGenerator  │ ← AI generates React code (Claude)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Supabase DB   │ ← Store design + component
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Component│ ← Production-ready code
└─────────────────┘
```

## What Gets Generated

For each Figma design, you receive:

1. **Component Code**
   - Clean React/TypeScript code
   - Functional components with hooks
   - Proper prop interfaces

2. **Styling**
   - Tailwind CSS classes
   - Responsive design
   - Design tokens applied

3. **Documentation**
   - Usage examples
   - Props documentation
   - Dependencies list

4. **Metadata**
   - Design complexity score
   - Extracted design tokens
   - Generation timestamp

## Performance Tips

### For Best Results

1. **Use Named Frames**: Name your Figma frames clearly (e.g., "LoginForm", "UserCard")
2. **Auto-Layout**: Use Figma's auto-layout feature for better conversion
3. **Component Instances**: Use Figma components for reusable elements
4. **Clear Hierarchy**: Organize your design with clear parent-child relationships
5. **Start Simple**: Test with simple designs first, then move to complex ones

### Generation Speed

- Simple designs (< 10 elements): 5-10 seconds
- Moderate designs (10-30 elements): 10-20 seconds
- Complex designs (30-50 elements): 20-40 seconds
- Very complex (> 50 elements): Consider breaking into smaller pieces

## Cost Considerations

### Anthropic API Usage

The `generate_react_from_figma` tool uses Claude API:
- Model: `claude-3-5-sonnet-20241022`
- Tokens per generation: ~2000-4000 (varies by design complexity)
- Cost: ~$0.01-0.02 per generation

### Figma API

- Free for personal use
- Rate limits: 60 requests per minute

### Supabase

- Free tier includes 500MB storage
- More than enough for thousands of generated components

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test with a simple Figma design
3. ✅ Generate your first component
4. ✅ Refine and customize the generated code
5. ✅ Integrate into your project
6. ✅ Generate more components as needed

## Support

For issues:
1. Check the troubleshooting section above
2. Review the main README.md
3. Check MCP server logs (console output)
4. Verify all API keys are valid

## Additional Resources

- Figma API Docs: https://www.figma.com/developers/api
- MCP Documentation: https://modelcontextprotocol.io/
- Anthropic API Docs: https://docs.anthropic.com/
- Tailwind CSS: https://tailwindcss.com/docs
