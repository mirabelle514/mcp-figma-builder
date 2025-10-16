# Pre-Launch Checklist

Use this checklist before using the Figma to React MCP Server.

##  Installation & Build

- [x] Dependencies installed (`npm install` in `mcp-server/`)
- [x] TypeScript compiled (`npm run build` in `mcp-server/`)
- [x] Main project built (`npm run build` in root)
- [x] No build errors

##  API Keys Required

### Must Have
- [ ] **Figma Access Token**
  - Get from: https://www.figma.com/developers/api#access-tokens
  - Format: `figd_...`
  - Location: Figma Settings → Personal Access Tokens

- [ ] **Anthropic API Key**
  - Get from: https://console.anthropic.com/
  - Format: `sk-ant-...`
  - Required for: `generate_react_from_figma` tool

- [ ] **Supabase Keys**
  - Already in `.env` file
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### Optional
- [ ] **GitHub Token** (only if Lumiere repo is private)
  - Get from: https://github.com/settings/tokens
  - Scope: `repo` (read access)

## 🗄️ Database

- [ ] Supabase project accessible
- [ ] Migrations applied:
  - `20251015130358_create_prompts_library.sql`
  - `20251015132648_redesign_for_component_mapping.sql`
  - `20251016000000_add_react_generation.sql` (NEW)
- [ ] Tables created:
  - `figma_designs`
  - `generated_components`
  - `generation_history`
  - `lumiere_components`
  - `figma_component_mappings`

##  Configuration

- [ ] Claude Desktop config file located:
  - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
  - **Linux**: `~/.config/Claude/claude_desktop_config.json`

- [ ] Config file contains:
```json
{
  "mcpServers": {
    "lumiere-figma": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_...",
        "SUPABASE_URL": "https://...",
        "SUPABASE_ANON_KEY": "...",
        "ANTHROPIC_API_KEY": "sk-ant-...",
        "LUMIERE_REPO_OWNER": "mirabelle514",
        "LUMIERE_REPO_NAME": "Lumiere-Design-System",
        "GITHUB_TOKEN": ""
      }
    }
  }
}
```

- [ ] Path to `index.js` is **absolute** (not relative)
- [ ] All API keys replaced with real values
- [ ] No placeholder text remaining

##  Claude Desktop

- [ ] Claude Desktop completely quit (not just minimized)
- [ ] Claude Desktop reopened
- [ ] New conversation started

##  Verification

Test each tool:

### 1. Check Tools Available
Ask Claude: "What MCP tools do you have available?"

Expected response should include:
- [ ] `scan_lumiere_repository`
- [ ] `analyze_figma_design`
- [ ] `generate_implementation_guide`
- [ ] `get_component_details`
- [ ] `generate_react_from_figma` 

### 2. Test Simple Generation
Prepare:
- [ ] Have a Figma file URL ready
- [ ] Ensure you have access to the Figma file
- [ ] File should be relatively simple for first test

Ask Claude:
```
Generate a React component from this Figma design:
[YOUR_FIGMA_URL]
```

Expected output:
- [ ] Complete React component code
- [ ] TypeScript interfaces
- [ ] Tailwind CSS classes
- [ ] Usage example
- [ ] Dependencies list
- [ ] No errors

### 3. Verify Database Storage
After generation:
- [ ] Check `figma_designs` table has new entry
- [ ] Check `generated_components` table has new entry
- [ ] Check `generation_history` table has success record

## 🚨 Troubleshooting

If tools not showing:
- [ ] Check Claude Desktop was fully restarted
- [ ] Verify absolute path in config
- [ ] Check `dist/index.js` exists
- [ ] Try rebuilding: `npm run build` in `mcp-server/`

If "ANTHROPIC_API_KEY required" error:
- [ ] API key added to config
- [ ] API key format is correct (starts with `sk-ant-`)
- [ ] Claude Desktop restarted after adding key

If "Figma API error":
- [ ] Token is valid and not expired
- [ ] You have access to the Figma file
- [ ] Figma URL format is correct

If generation fails:
- [ ] Try simpler design first
- [ ] Check design isn't too complex (>50 elements)
- [ ] Verify all API keys are working
- [ ] Check Supabase connection

##  Success Indicators

You'll know it's working when:
- [x] All 5 MCP tools show up in Claude
- [ ] Simple Figma URL generates component without errors
- [ ] Generated code is valid React/TypeScript
- [ ] Database entries created successfully
- [ ] Generation takes 10-30 seconds (normal)

##  Ready to Use

Once all items checked:
- [ ] System is fully operational
- [ ] Can generate components from Figma
- [ ] Database storing all data
- [ ] Can iterate and regenerate

## 📈 Next Steps

After successful setup:
1. [ ] Test with your actual Figma designs
2. [ ] Generate multiple components
3. [ ] Refine generated code as needed
4. [ ] Integrate into your project
5. [ ] Adjust Tailwind classes for your design system
6. [ ] Add business logic and interactivity

##  Pro Tips

- Start with simple designs to test
- Use clear, descriptive names in Figma
- Leverage Figma auto-layout for better results
- Generate individual components, not entire pages
- Expect to refine 15-30% of generated code
- Store good prompts for consistent results
- Review generated code before using in production

##  Getting Help

If stuck:
1. Review `SETUP.md` for detailed instructions
2. Check `IMPLEMENTATION_SUMMARY.md` for architecture
3. Read `README.md` for usage examples
4. Verify all environment variables
5. Check MCP server console logs
6. Ensure API keys are valid and have correct permissions

##  You're Ready!

When all checkboxes are complete, you have a working Figma to React code generation system!

**What you can do:**
- Generate React components from any Figma design
- Convert Figma layouts to Tailwind CSS
- Extract design tokens automatically
- Store and retrieve generation history
- Iterate on designs quickly

**Time savings:**
- Manual coding: 10+ hours per component
- With this tool: 1-2 hours per component
- **Savings: 80-90% time reduction**

Start generating! 
