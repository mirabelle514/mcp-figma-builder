# Quick Test Checklist

Use this checklist to test all three modes step-by-step.

---

## Pre-Test Setup

### 1. Build the Server

```bash
cd mcp-server
npm install
npm run build
```

**Check:** `mcp-server/dist/index.js` exists ✅

### 2. Get Your API Keys

**Required for ALL modes:**
- [ ] Figma token: https://www.figma.com/ → Settings → Tokens
- [ ] Supabase keys: Check your `.env` file

**Optional (for AI modes):**
- [ ] Anthropic key: https://console.anthropic.com/ (for Mode 2)
- [ ] OpenAI key: https://platform.openai.com/api-keys (for Mode 3)

### 3. Prepare Test Figma File

Create a simple Figma design with:
- [ ] A button (label: "Sign In")
- [ ] A text input (placeholder: "Email")
- [ ] A heading (text: "Welcome")

Get the Figma URL with node-id.

---

## Test Mode 1: Component Mapping Only

### Configuration

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_YOUR_TOKEN",
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_ANON_KEY": "YOUR_KEY",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui"
      }
    }
  }
}
```

**NO AI keys included** ✅

### Test Steps

- [ ] 1. Restart Claude Desktop (Quit completely, reopen)
- [ ] 2. Open Claude Desktop
- [ ] 3. Type: "Scan the EUI repository"
- [ ] 4. Wait for scan to complete (30-60 sec)
- [ ] 5. Type: "Analyze this Figma design: [YOUR_URL]"
- [ ] 6. Review matched EUI components
- [ ] 7. Type: "Generate a React component from this Figma design: [YOUR_URL]"
- [ ] 8. Should see error: "AI generation requires an API key"

**Mode 1 Success Criteria:**
- ✅ Repository scan works
- ✅ Component matching works
- ✅ AI generation shows clear error (expected!)

---

## Test Mode 2: Anthropic AI

### Configuration Update

Add this line to your config:

```json
"ANTHROPIC_API_KEY": "sk-ant-YOUR_KEY"
```

### Test Steps

- [ ] 1. Restart Claude Desktop (Quit completely, reopen)
- [ ] 2. Check logs show: "AI Mode: AI Generation Enabled (Anthropic Claude)"
- [ ] 3. Type: "Analyze this Figma design: [YOUR_URL]" (still works!)
- [ ] 4. Type: "Generate a React component from this Figma design: [YOUR_URL]"
- [ ] 5. Wait 10-30 seconds
- [ ] 6. Review generated React code
- [ ] 7. Check metadata shows "Anthropic Claude"

**Mode 2 Success Criteria:**
- ✅ Component mapping still works
- ✅ AI generation produces valid React/TypeScript code
- ✅ Code uses Tailwind CSS
- ✅ Metadata shows Claude model

---

## Test Mode 3: OpenAI

### Configuration Update

**Remove:**
```json
"ANTHROPIC_API_KEY": "sk-ant-..."
```

**Add:**
```json
"OPENAI_API_KEY": "sk-YOUR_OPENAI_KEY"
```

### Test Steps

- [ ] 1. Restart Claude Desktop (Quit completely, reopen)
- [ ] 2. Check logs show: "AI Mode: AI Generation Enabled (OpenAI GPT-4)"
- [ ] 3. Type: "Analyze this Figma design: [YOUR_URL]" (still works!)
- [ ] 4. Type: "Generate a React component from this Figma design: [YOUR_URL]"
- [ ] 5. Wait 10-30 seconds
- [ ] 6. Review generated React code
- [ ] 7. Check metadata shows "OpenAI"

**Mode 3 Success Criteria:**
- ✅ Component mapping still works
- ✅ AI generation produces valid React/TypeScript code
- ✅ Code uses Tailwind CSS
- ✅ Metadata shows OpenAI model

---

## Quick Commands Reference

### Component Mapping (All Modes)
```
Scan the EUI repository

Analyze this Figma design: [URL]

Generate an implementation guide for this Figma design: [URL]

Get details about the EuiButton component
```

### AI Generation (Modes 2 & 3)
```
Generate a React component from this Figma design: [URL]
```

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| "Tool not found" | Restart Claude Desktop completely |
| "Missing env variables" | Check all required fields in config |
| "AI requires API key" | You're in Mode 1 (this is correct!) |
| "Figma API error" | Check token, verify file access |
| "No components found" | Verify repo owner/name |

---

## Example Test Figma URL

Format:
```
https://www.figma.com/design/FhScFrbbi6hYCvubHQjI9T/My-Design?node-id=4-38
```

Parts:
- `FhScFrbbi6hYCvubHQjI9T` = File ID
- `My-Design` = File name
- `4-38` = Node ID (specific frame)

---

## Test Results Template

```
Date: ___________
Tester: ___________

MODE 1 (Component Mapping Only)
- Repository scan: ☐ Pass ☐ Fail
- Figma analysis: ☐ Pass ☐ Fail
- AI generation error: ☐ Pass (shows error) ☐ Fail
- Notes: ___________

MODE 2 (Anthropic)
- AI mode detected: ☐ Pass ☐ Fail
- Component mapping: ☐ Pass ☐ Fail
- AI generation: ☐ Pass ☐ Fail
- Code quality: ☐ Good ☐ Needs work
- Notes: ___________

MODE 3 (OpenAI)
- AI mode detected: ☐ Pass ☐ Fail
- Component mapping: ☐ Pass ☐ Fail
- AI generation: ☐ Pass ☐ Fail
- Code quality: ☐ Good ☐ Needs work
- Notes: ___________

Overall Result: ☐ All Passed ☐ Some Issues
```

---

## After Testing

- [ ] Document which mode you'll use
- [ ] Share results with team
- [ ] Update config for production use
- [ ] Test with real designs
- [ ] Train team members

---

## Need More Help?

- **Full guide:** `docs/TESTING_GUIDE.md`
- **Team guide:** `docs/TEAM_SETUP_GUIDE.md`
- **Setup details:** `mcp-server/README.md`

Happy testing! 🚀
