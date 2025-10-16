# Troubleshooting Guide

Complete guide to diagnosing and fixing common issues with the Figma-to-Component tool.

---

##  Quick Diagnosis

### Step 1: Identify the Problem Area

**Where does it fail?**
- [ ] Setup wizard won't start
- [ ] Claude Desktop doesn't see the tool
- [ ] Commands don't work in Claude
- [ ] Repository scanning fails
- [ ] Figma designs can't be accessed
- [ ] Component generation fails
- [ ] Generated code has errors

---

##  Setup Issues

### Problem: Setup Wizard Won't Start

**Symptoms:**
```bash
npm run dev
# Error: Cannot find module...
# Or: Port 5173 already in use
```

**Solutions:**

1. **Missing dependencies:**
```bash
# Clean install
rm -rf node_modules
npm install
npm run dev
```

2. **Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
# Or use different port
PORT=3000 npm run dev
```

3. **Node version too old:**
```bash
node --version  # Should be 16+
# Update Node.js if needed
```

---

### Problem: Build Fails

**Symptoms:**
```bash
npm run build
# TypeScript errors
# Or: Module not found
```

**Solutions:**

1. **TypeScript errors:**
```bash
# Check what's wrong
npm run typecheck

# Common fix: update types
npm install --save-dev @types/react@latest @types/react-dom@latest
```

2. **Missing dependencies:**
```bash
# Verify package.json
npm install
npm run build
```

3. **Cache issues:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

---

##  MCP Server Connection Issues

### Problem: Claude Desktop Doesn't See the Tool

**Symptoms:**
- Tool not listed in Claude Desktop
- No hammer icon appears
- Commands don't work

**Step-by-Step Fix:**

**1. Verify config file exists:**

macOS:
```bash
ls -la ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Windows:
```cmd
dir %APPDATA%\Claude\claude_desktop_config.json
```

**2. Verify config syntax:**
```bash
# Check for JSON errors
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Should show your config without errors
```

**3. Verify path is absolute:**

Your config should have:
```json
{
  "mcpServers": {
    "component-figma": {
      "command": "node",
      "args": ["/absolute/path/to/project/mcp-server/dist/index.js"]
    }
  }
}
```

 **Wrong:** `"./mcp-server/dist/index.js"` (relative)
 **Right:** `"/Users/you/projects/tool/mcp-server/dist/index.js"` (absolute)

**4. Verify MCP server is built:**
```bash
cd mcp-server
ls -la dist/index.js  # Should exist

# If not, build it:
npm install
npm run build
```

**5. Check for syntax errors in config:**

Common mistakes:
- Missing commas
- Trailing commas
- Unescaped backslashes (Windows)
- Wrong quotes (use `"` not `'`)

**6. Restart Claude Desktop properly:**
- **macOS:** Cmd+Q, then reopen
- **Windows:** Right-click taskbar icon → Exit, then reopen
- **Not enough:** Just closing window

**7. Check Claude Desktop logs:**

macOS:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

Look for errors like:
- "Cannot find module"
- "ENOENT: no such file"
- "SyntaxError: Unexpected token"

---

### Problem: MCP Server Crashes on Start

**Symptoms:**
```
Error: Cannot find module '@anthropic-ai/sdk'
Error: Missing environment variable
```

**Solutions:**

**1. Missing dependencies:**
```bash
cd mcp-server
rm -rf node_modules
npm install
npm run build
```

**2. Missing environment variables:**

Check your config has all required vars:
```json
{
  "env": {
    "FIGMA_ACCESS_TOKEN": "figd_...",
    "SUPABASE_URL": "https://...",
    "SUPABASE_ANON_KEY": "eyJ...",
    "LUMIERE_REPO_OWNER": "elastic",
    "LUMIERE_REPO_NAME": "eui"
  }
}
```

**3. Build errors:**
```bash
cd mcp-server
npm run build 2>&1 | grep error
# Fix any TypeScript errors shown
```

---

##  Authentication Issues

### Problem: "Invalid Figma Access Token"

**Symptoms:**
```
Error: 403 Forbidden
Error: Invalid token
Cannot access Figma file
```

**Solutions:**

**1. Token expired or wrong:**
```bash
# Test your token
curl https://api.figma.com/v1/me \
  -H "X-Figma-Token: YOUR_TOKEN"

# Should return your user info
```

**2. Generate new token:**
1. Go to https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Copy and update in config

**3. Token has wrong permissions:**
- Token must be from your personal account
- Must have access to the files you're trying to read
- Check file sharing settings in Figma

---

### Problem: "Invalid GitHub Token"

**Symptoms:**
```
Error: 401 Unauthorized
Cannot access repository
Rate limit exceeded
```

**Solutions:**

**1. For public repos:**
- GitHub token is optional
- Remove `GITHUB_TOKEN` from config if you don't need it

**2. For private repos or rate limits:**

Generate token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (for private repos) or `public_repo` (for public)
4. Copy and add to config

**3. Token has wrong permissions:**
```bash
# Test your token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.github.com/repos/OWNER/REPO

# Should return repo info
```

---

### Problem: "No AI provider configured"

**Symptoms:**
```
Error: ANTHROPIC_API_KEY environment variable is required
Error: No AI provider configured
```

**Solutions:**

**For Mode 2 (Anthropic):**
```json
{
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-..."
  }
}
```

**For Mode 3 (OpenAI):**
```json
{
  "env": {
    "OPENAI_API_KEY": "sk-..."
  }
}
```

**For Mode 4 (Custom AI):**
```json
{
  "env": {
    "CUSTOM_AI_PROVIDER": "true",
    "CUSTOM_AI_URL": "https://...",
    "CUSTOM_AI_KEY": "..."
  }
}
```

**Test your API key:**

Anthropic:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

OpenAI:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hi"}],"max_tokens":10}'
```

---

##  Database Issues

### Problem: "Cannot connect to Supabase"

**Symptoms:**
```
Error: Failed to connect to database
Error: Invalid Supabase credentials
```

**Solutions:**

**1. Check credentials:**

Get from Supabase dashboard:
- Project Settings → API
- Copy `URL` and `anon public` key

**2. Test connection:**
```bash
curl "https://YOUR-PROJECT.supabase.co/rest/v1/" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return API info
```

**3. Verify .env file:**
```bash
cat .env
# Should have:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**4. Apply migrations:**
```bash
# Migrations should auto-apply, but verify:
ls supabase/migrations/
# Should see .sql files
```

---

### Problem: "Table does not exist"

**Symptoms:**
```
Error: relation "lumiere_components" does not exist
Error: relation "figma_designs" does not exist
```

**Solutions:**

**1. Check migrations were applied:**

In Supabase dashboard:
- Go to SQL Editor
- Run: `SELECT * FROM lumiere_components LIMIT 1;`
- Should work or show empty results (not error)

**2. Manually apply migrations:**

In Supabase SQL Editor, run each file from `supabase/migrations/` in order:
1. `20251015130358_create_prompts_library.sql`
2. `20251015132648_redesign_for_component_mapping.sql`
3. `20251016000000_add_react_generation.sql`

---

##  Repository Scanning Issues

### Problem: "Repository scan fails"

**Symptoms:**
```
Error: Cannot access repository
Error: Repository not found
Empty component list
```

**Solutions:**

**1. Verify repository is correct:**
```bash
# Test on GitHub directly
open https://github.com/OWNER/REPO
# Should open the repo
```

**2. Check repository name format:**

 **Wrong:**
```json
"LUMIERE_REPO_OWNER": "elastic/eui"
```

 **Right:**
```json
"LUMIERE_REPO_OWNER": "elastic",
"LUMIERE_REPO_NAME": "eui"
```

**3. For private repos:**
- Must have `GITHUB_TOKEN` configured
- Token must have `repo` scope
- You must have access to the repo

**4. Repository too large:**
- Scanning 10,000+ files can take 2-5 minutes
- Be patient, don't interrupt
- Check logs for progress

---

### Problem: "No components found"

**Symptoms:**
- Scan completes but finds 0 components
- Database empty after scan

**Solutions:**

**1. Check repository structure:**

Tool looks for:
- `.tsx` and `.ts` files
- `README.md` files
- Folders named: `components`, `src`, `packages`

**2. Try different repository:**

Test with known-working repo:
```json
"LUMIERE_REPO_OWNER": "elastic",
"LUMIERE_REPO_NAME": "eui"
```

**3. Check database manually:**

In Supabase SQL Editor:
```sql
SELECT * FROM lumiere_components LIMIT 10;
```

Should show scanned components.

---

##  Figma Issues

### Problem: "Cannot access Figma file"

**Symptoms:**
```
Error: File not found
Error: 404
Cannot read design data
```

**Solutions:**

**1. Verify URL format:**

 **Correct formats:**
```
https://www.figma.com/file/ABC123/File-Name
https://www.figma.com/design/ABC123/File-Name
https://www.figma.com/file/ABC123/File-Name?node-id=1-2
```

 **Wrong:**
```
https://www.figma.com/proto/...  (prototype view)
figma.com/file/...  (missing https://)
```

**2. Check file permissions:**
- File must be shared with you
- Or must be in your workspace
- Or must be public/Community file

**3. Extract file key manually:**

From URL: `https://www.figma.com/file/ABC123/Name`
File key is: `ABC123`

Test:
```bash
curl https://api.figma.com/v1/files/ABC123 \
  -H "X-Figma-Token: YOUR_TOKEN"
```

---

### Problem: "Node not found"

**Symptoms:**
```
Error: Node ID not found
Cannot find specified component
```

**Solutions:**

**1. Use file URL without node-id:**
```
# Instead of:
https://www.figma.com/file/ABC/Name?node-id=1-2

# Use:
https://www.figma.com/file/ABC/Name
```

**2. Or get correct node ID:**
- Right-click element in Figma
- Copy/Paste → Copy link
- Use that full URL

---

##  AI Generation Issues

### Problem: "AI generation fails"

**Symptoms:**
```
Error: API request failed
Error: Rate limit exceeded
Error: Invalid API key
```

**Solutions:**

**1. Check API key is valid:**
- See "Authentication Issues" section above
- Verify key hasn't expired
- Check you have credits/quota

**2. Rate limits:**

Anthropic:
- Default: 1000 requests/day
- Wait and retry
- Or upgrade plan

OpenAI:
- Depends on your tier
- Check: https://platform.openai.com/usage
- Add payment method if needed

**3. API downtime:**
```bash
# Check status
open https://status.anthropic.com
open https://status.openai.com
```

**4. Request too large:**
- Large Figma designs can create huge prompts
- Try smaller components
- Or reduce design complexity

---

### Problem: "Generated code has errors"

**Symptoms:**
- TypeScript errors in generated code
- Missing imports
- Wrong component names
- Doesn't match design

**Solutions:**

**1. Verify component scan happened:**
```
# In Claude Desktop:
Get details about EuiButton
```

Should return component info. If not, scan first:
```
Scan the eui repository
```

**2. Check database has components:**

Supabase SQL Editor:
```sql
SELECT COUNT(*) FROM lumiere_components;
-- Should be > 0
```

**3. Provide more context:**
```
Generate a React component from [FIGMA_URL]

Use EuiButton for the button
Use EuiPanel for the card
Make it responsive
```

**4. Try regenerating:**
- AI is non-deterministic
- Try the same prompt again
- May get better results

---

##  Mode 4 (Custom AI) Issues

### Problem: "Custom AI connection fails"

**Symptoms:**
```
Error: Failed to generate completion from CustomAI
Error: Network request failed
```

**Solutions:**

**1. Test endpoint directly:**
```bash
curl -X POST https://your-ai-url/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Test"}],"max_tokens":50}'
```

Should return JSON with `choices` array.

**2. Check URL format:**

 **Correct:**
```
https://ai.company.com/v1/chat/completions
```

 **Wrong:**
```
https://ai.company.com  (missing path)
https://ai.company.com/v1  (missing /chat/completions)
```

**3. Verify API key:**
- Contact your AI team
- Regenerate key if needed
- Check for typos

**4. Network access:**
- If internal: Must be on VPN
- Check firewall rules
- Verify DNS resolution

**5. API format mismatch:**

Your API must return:
```json
{
  "choices": [{
    "message": {
      "content": "Generated code here"
    }
  }]
}
```

If format differs, see `docs/CUSTOM_AI_PROVIDER.md` → Customization section.

---

## 🔨 General Debugging

### Enable Verbose Logging

**1. Check MCP server logs:**

macOS:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

Windows:
```cmd
type %LOCALAPPDATA%\Claude\logs\mcp*.log
```

**2. Add debug logging:**

In `mcp-server/src/index.ts`, add:
```typescript
console.log('[DEBUG] Tool called:', toolName);
console.log('[DEBUG] Arguments:', JSON.stringify(args));
```

Rebuild and check logs.

---

### Test Components Individually

**1. Test Figma service:**
```bash
cd mcp-server
node -e "
import('./dist/services/figma-service.js').then(mod => {
  const service = new mod.FigmaService('YOUR_TOKEN');
  service.getFile('FILE_KEY').then(console.log);
});
"
```

**2. Test Supabase connection:**
```bash
node -e "
import('./dist/services/db-service.js').then(mod => {
  const db = new mod.DatabaseService('URL', 'KEY');
  db.getLumiereComponents().then(r => console.log(r.length));
});
"
```

---

### Common Error Messages

| Error | Likely Cause | Solution |
|-------|-------------|----------|
| `ENOENT` | File not found | Check path is absolute |
| `ECONNREFUSED` | Service not running | Check URL/port |
| `401 Unauthorized` | Invalid API key | Check token |
| `403 Forbidden` | No permission | Check permissions |
| `404 Not Found` | Wrong URL/ID | Verify URL |
| `429 Rate Limited` | Too many requests | Wait and retry |
| `500 Internal Error` | Service error | Check service status |

---

##  Getting Help

### Before Asking for Help

Collect this information:

1. **Error message:**
```bash
# Copy exact error from Claude Desktop or logs
```

2. **Configuration (redacted):**
```json
{
  "env": {
    "FIGMA_ACCESS_TOKEN": "figd_xxx...",  // First 10 chars only
    "SUPABASE_URL": "https://xxx.supabase.co",
    "ANTHROPIC_API_KEY": "sk-ant-xxx..."  // First 10 chars only
  }
}
```

3. **Environment:**
- OS: macOS 14.2 / Windows 11 / etc.
- Node version: `node --version`
- Claude Desktop version: (from About)

4. **What you tried:**
- List troubleshooting steps you already attempted

---

### Support Resources

1. **Documentation:**
   - `README.md` - Overview
   - `docs/SETUP_WIZARD.md` - Setup guide
   - `docs/CONFIGURATION.md` - Config details
   - `docs/CUSTOM_AI_PROVIDER.md` - Mode 4 guide

2. **Check examples:**
   - Look at `docs/` folder for working configs
   - Compare your config to examples

3. **Test with known-good:**
   - Use example repo: `elastic/eui`
   - Use example Figma file
   - Verify basic functionality first

---

##  Health Check Checklist

Run through this checklist to verify everything is working:

```bash
# 1. Project builds
npm run build
#  Should complete without errors

# 2. MCP server builds
cd mcp-server && npm run build
#  Should create dist/index.js

# 3. Config file exists
ls ~/Library/Application\ Support/Claude/claude_desktop_config.json
#  Should exist

# 4. Config is valid JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
#  Should parse without errors

# 5. All tokens are valid
# Test each API as shown in Authentication section
#  All should return success

# 6. Database accessible
# Check in Supabase dashboard
#  Should connect

# 7. Claude Desktop sees tool
# Look for hammer icon
#  Should appear after restart
```

---

**If you've tried everything here and still have issues, collect the information from "Before Asking for Help" and reach out with details!** 🤝
