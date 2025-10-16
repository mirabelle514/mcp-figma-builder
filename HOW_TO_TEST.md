# How To Test: Complete Guide

##  Overview

You now have an MCP server with **3 modes**:
1. **Component Mapping Only** (Free, no AI)
2. **With Anthropic Claude** (AI code generation)
3. **With OpenAI GPT-4** (AI code generation)

This guide shows you how to test all three.

---

##  Testing Resources

We've created multiple guides for you:

| Guide | Purpose | Best For |
|-------|---------|----------|
| **QUICK_TEST_CHECKLIST.md** | Simple checkbox list | Quick validation |
| **VISUAL_TEST_GUIDE.md** | Step-by-step with examples | First-time setup |
| **TESTING_GUIDE.md** | Comprehensive reference | Troubleshooting |
| **TEAM_SETUP_GUIDE.md** | Team onboarding | Sharing with others |

**Start here:** `docs/VISUAL_TEST_GUIDE.md`

---

## ⚡ Quick Start (5 Minutes)

### 1. Build

```bash
cd mcp-server
npm install
npm run build
```

### 2. Configure Claude Desktop

**File location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Minimum config (Mode 1):**
```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_key",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui"
      }
    }
  }
}
```

### 3. Restart Claude Desktop

Fully quit (Cmd+Q on Mac), then reopen.

### 4. Test

Type in Claude Desktop:
```
Scan the EUI repository
```

---

##  Testing Each Mode

### Mode 1: Component Mapping Only

**Config:** No AI keys (see above)

**Test command:**
```
Analyze this Figma design: https://www.figma.com/design/...
```

**Expected:** List of EUI components with import statements

**AI test (should fail):**
```
Generate a React component from this Figma design: [URL]
```

**Expected:** Error message saying AI key is needed 

---

### Mode 2: Add Anthropic

**Config update:** Add to `env` section:
```json
"ANTHROPIC_API_KEY": "sk-ant-your-key"
```

Get key: https://console.anthropic.com/

**Test command:**
```
Generate a React component from this Figma design: [URL]
```

**Expected:** Complete React/TypeScript code with Tailwind CSS

---

### Mode 3: Switch to OpenAI

**Config update:** Replace Anthropic key with:
```json
"OPENAI_API_KEY": "sk-your-key"
```

Get key: https://platform.openai.com/api-keys

**Test command:**
```
Generate a React component from this Figma design: [URL]
```

**Expected:** Complete React/TypeScript code with Tailwind CSS

---

##  Test Checklist

Copy this to track your testing:

```
[ ] Installed dependencies (npm install)
[ ] Built server (npm run build)
[ ] Configured Claude Desktop
[ ] Restarted Claude Desktop

Mode 1 Tests:
[ ] Repository scan works
[ ] Figma analysis works
[ ] Component matching works
[ ] AI generation shows error (expected!)

Mode 2 Tests (Anthropic):
[ ] Added API key
[ ] Restarted Claude Desktop
[ ] Component mapping still works
[ ] AI generation produces code
[ ] Code is valid React/TypeScript

Mode 3 Tests (OpenAI):
[ ] Switched to OpenAI key
[ ] Restarted Claude Desktop
[ ] Component mapping still works
[ ] AI generation produces code
[ ] Code is valid React/TypeScript

[ ] Tested with simple design
[ ] Tested with medium complexity
[ ] Shared results with team
```

---

##  Success Criteria

### Mode 1 Success
- Repository scan completes in 30-60 seconds
- Figma analysis returns matched components in 3-10 seconds
- AI generation shows helpful error message
- No unexpected errors

### Mode 2/3 Success
- Everything from Mode 1 works
- AI generation produces valid code in 10-30 seconds
- Generated code includes:
  - TypeScript interfaces
  - Tailwind CSS classes
  - React hooks
  - Proper imports
- Metadata shows correct AI provider

---

## 🐛 Troubleshooting

### "Tool not found"
→ Restart Claude Desktop completely

### "Missing required environment variables"
→ Check all fields in config are filled in

### "AI generation requires an API key"
→ **This is expected in Mode 1!** Add API key for Mode 2 or 3

### "Figma API error"
→ Check FIGMA_ACCESS_TOKEN is valid and you have access to the file

### "No components found"
→ Verify LUMIERE_REPO_OWNER and LUMIERE_REPO_NAME are correct

### Build errors
→ Run `cd mcp-server && npm install && npm run build`

### Nothing happens
→ Check absolute path in config points to `mcp-server/dist/index.js`

---

##  Detailed Guides

### For Your First Test
→ Read `docs/VISUAL_TEST_GUIDE.md`
- Shows exactly what to type
- Shows expected responses
- Step-by-step screenshots

### For Complete Testing
→ Read `docs/TESTING_GUIDE.md`
- All test scenarios
- Performance expectations
- Troubleshooting details

### For Your Team
→ Share `docs/TEAM_SETUP_GUIDE.md`
- Easy onboarding
- Clear mode choices
- Best practices

### For Mode Comparison
→ Read `docs/SETUP_MODES.md`
- Feature comparison table
- Cost analysis
- Decision tree

---

##  After Testing

### If Mode 1 Works:
- You can use component mapping immediately
- Add AI later if needed
- Zero ongoing costs

### If Mode 2/3 Works:
- You can generate custom components
- Expect 70-85% code generation
- Plan to refine 15-30%

### Share with Team:
1. Document which mode you're using
2. Share test results
3. Provide setup instructions
4. Train team members

---

##  Testing Tips

### Start Simple
- Test with 1-2 element designs first
- Use clear Figma layer names
- Try Figma auto-layout

### Iterate
- Test component mapping first
- Add AI generation second
- Try complex designs last

### Document
- Record what works
- Note any issues
- Share with team

### Measure
- Track time savings
- Compare to manual implementation
- Calculate ROI

---

##  Expected Performance

### Component Mapping (All Modes)
- Initial scan: 30-60 seconds
- Analysis: 3-10 seconds
- Guide generation: 5-15 seconds

### AI Generation (Modes 2 & 3)
- Simple component: 10-20 seconds
- Medium component: 20-30 seconds
- Complex component: 30-45 seconds

---

##  Next Steps

1. **Test Mode 1** - Verify component mapping works
2. **Try AI mode** - Choose Anthropic or OpenAI
3. **Test real designs** - Use actual project files
4. **Share results** - Show team what's possible
5. **Production use** - Integrate into workflow

---

##  Need Help?

1. Check troubleshooting section above
2. Review detailed guides in `docs/`
3. Verify all environment variables
4. Test with simple designs first
5. Check Claude Desktop logs

---

##  You're Ready!

All the code changes are complete. You have:
-  3 configuration modes
-  OpenAI support added
-  No-AI mode working
-  Complete documentation
-  Testing guides
-  Team onboarding materials

**Just run the tests and start using it!**

---

##  Quick Reference

```bash
# Build
cd mcp-server && npm install && npm run build

# Config file (Mac)
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Test commands (in Claude Desktop)
Scan the EUI repository
Analyze this Figma design: [URL]
Generate a React component from this Figma design: [URL]
Get details about the EuiButton component
```

**Happy testing! **
