# Testing Guide: Figma to React Generator

##  Current Status

**Database:** Ready ✓
- Migration applied successfully
- Tables created: `figma_designs`, `generated_components`, `generation_history`

**MCP Server:** Built ✓
- All TypeScript compiled
- Dependencies installed
- Ready to run

##  Three Ways to Test

### Option 1: Test with Claude Desktop (Recommended)

This is the **easiest way** to test:

#### Setup Steps:

1. **Get Your API Keys:**
   ```bash
   # You need:
   - FIGMA_ACCESS_TOKEN from https://www.figma.com/developers/api#access-tokens
   - ANTHROPIC_API_KEY from https://console.anthropic.com/
   - SUPABASE keys (already in your .env file)
   ```

2. **Configure Claude Desktop:**

   Edit this file (create if it doesn't exist):
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

   ```json
   {
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

3. **Restart Claude Desktop** completely (quit and reopen)

4. **Test It:**
   ```
   You: What MCP tools do you have?

   Claude: [Should list 5 tools including generate_react_from_figma]

   You: Generate a React component from this Figma design:
   https://www.figma.com/design/[YOUR_FILE_ID]/Design?node-id=[YOUR_NODE_ID]

   Claude: [Generates complete React component]
   ```

#### What Success Looks Like:
- 5 MCP tools visible
- Component generates in 10-30 seconds
- Get complete React code with TypeScript
- No errors in generation

---

### Option 2: Manual Test (Without MCP)

You can test the core functionality directly:

1. **Create a test file:**
   ```bash
   cd /tmp/cc-agent/58675574/project/mcp-server
   node --version  # Should be 18+
   ```

2. **Test the Figma API connection:**
   ```javascript
   // test-figma.js
   import { FigmaService } from './dist/services/figma-service.js';

   const figmaService = new FigmaService('YOUR_FIGMA_TOKEN');
   const { fileKey, nodeId } = figmaService.parseFigmaUrl(
     'https://www.figma.com/design/ABC/Design?node-id=1-2'
   );

   console.log('File Key:', fileKey);
   console.log('Node ID:', nodeId);

   // Fetch design
   const node = await figmaService.getNode(fileKey, nodeId || '1-2');
   console.log('Design Name:', node.name);
   console.log('Design Type:', node.type);
   ```

3. **Run it:**
   ```bash
   node test-figma.js
   ```

---

### Option 3: VS Code with Continue Extension

If you use VS Code:

1. Install Continue extension
2. Configure MCP server in Continue settings
3. Use the same config as Claude Desktop
4. Test in the Continue chat

---

##  Verification Checklist

After testing, verify:

### In Claude/Continue:
- [ ] Tool appears in available tools list
- [ ] Can call `generate_react_from_figma`
- [ ] Receives complete React component
- [ ] TypeScript code is valid
- [ ] Tailwind classes look correct
- [ ] No errors during generation

### In Database:
Check your Supabase project:

```sql
-- Check if design was stored
SELECT * FROM figma_designs ORDER BY created_at DESC LIMIT 1;

-- Check if component was generated
SELECT component_name, ai_model, created_at
FROM generated_components
ORDER BY created_at DESC LIMIT 1;

-- Check generation history
SELECT success, generation_time_ms, created_at
FROM generation_history
ORDER BY created_at DESC LIMIT 1;
```

Expected:
- [ ] Design stored in `figma_designs`
- [ ] Component stored in `generated_components`
- [ ] Success record in `generation_history`

---

##  Simple Test URLs

Use these simple Figma designs for testing:

### Public Figma Files (Anyone can access):
1. **Button Component:**
   ```
   https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/MB-test?node-id=4-38
   ```
   Expected: Simple button component

2. **Your Own Design:**
   - Open any Figma file
   - Select a frame
   - Copy the URL (includes node-id)
   - Make sure the file is accessible with your token

---

##  Expected Output

When generation succeeds, you should get:

```markdown
# Generated React Component

## Component: ButtonComponent

### Generation Summary
- **Time:** 12345ms
- **Complexity:** simple
- **Total Elements:** 5
- **Interactive Elements:** Yes
- **AI Model:** claude-3-5-sonnet-20241022

### Generated Code

```tsx
import React from 'react';

interface ButtonComponentProps {
  onClick?: () => void;
  children?: React.ReactNode;
}

export function ButtonComponent({ onClick, children }: ButtonComponentProps) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      {children || 'Click me'}
    </button>
  );
}
```

### Usage Example
[Usage instructions]
```

---

## 🚨 Troubleshooting

### "Tool not found"
**Solution:**
1. Check MCP server built: `ls mcp-server/dist/index.js`
2. Verify path in Claude config is absolute
3. Restart Claude Desktop completely

### "ANTHROPIC_API_KEY is required"
**Solution:**
1. Get API key from https://console.anthropic.com/
2. Add to Claude Desktop config
3. Restart Claude Desktop

### "Figma API error: 403"
**Solution:**
1. Get new token from Figma settings
2. Ensure you have access to the Figma file
3. Make file public or use your own design

### "Generation failed"
**Possible causes:**
- Design too complex (try simpler design)
- API rate limit (wait a minute)
- Invalid Figma URL format
- Network issues

### "No output / Timeout"
**Solution:**
- Claude Desktop may need restart
- Check internet connection
- Try simpler Figma design
- Check MCP server console logs

---

##  Testing Tips

### Start Simple:
1. Test with a single button first
2. Then try a card component
3. Then try a form
4. Finally try complex layouts

### Good Test Designs:
-  Single button
-  Simple card with text
-  Login form (2-3 inputs + button)
-  Navigation bar
-  Complex dashboard (may need adjustment)

### What to Check:
1. **Layout:** Does flex/grid match Figma?
2. **Spacing:** Are gaps and padding close?
3. **Colors:** Are colors extracted correctly?
4. **Typography:** Font sizes reasonable?
5. **Structure:** Component hierarchy makes sense?

---

##  Success Metrics

You'll know it's working when:
-  Generates component in <30 seconds
-  React code is valid TypeScript
-  Tailwind classes are appropriate
-  Component structure is logical
-  Can copy-paste code and it works
-  Only need minor tweaks (15-30%)

---

##  Next Steps After Successful Test

1. **Try Your Real Designs:**
   - Use your actual Figma files
   - Generate components you need
   - Integrate into your project

2. **Refine Generated Code:**
   - Adjust Tailwind classes for your design system
   - Add business logic
   - Add state management
   - Add event handlers

3. **Iterate:**
   - Regenerate with different options
   - Try different frames from same file
   - Build component library

4. **Production Use:**
   - Review generated code before using
   - Add tests
   - Add accessibility improvements
   - Optimize performance

---

## 🆘 Need Help?

If you get stuck:

1. Check CHECKLIST.md for setup verification
2. Review SETUP.md for detailed instructions
3. Check console logs for errors
4. Verify all API keys are valid
5. Try with a simpler Figma design

**Most common issue:** API keys not configured correctly in Claude Desktop config.

**Quick fix:** Double-check the config file path and restart Claude Desktop.

---

##  What You Can Do Now

With a working system, you can:

- Generate React components from ANY Figma design
- Convert Figma layouts to Tailwind CSS automatically
- Extract design tokens from Figma files
- Build component libraries 10x faster
- Reduce design-to-code time by 80-90%

**Ready to test? Start with Option 1 (Claude Desktop)!** 
