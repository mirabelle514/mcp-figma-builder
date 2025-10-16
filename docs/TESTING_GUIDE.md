# Testing Guide: All Three Modes

This guide shows you how to test each mode of the EUI-Figma MCP Server.

---

## Prerequisites

### 1. Build the MCP Server

```bash
cd mcp-server
npm install
npm run build
```

**Expected output:**
```
✓ compiled successfully
```

### 2. Verify Build Output

```bash
ls -la mcp-server/dist/
```

**Should see:**
- `index.js`
- Other compiled `.js` files
- Service files

---

## Testing Mode 1: Component Mapping Only

### Step 1: Configure Without AI Keys

Edit your Claude Desktop config:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_actual_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_actual_supabase_key",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui",
        "GITHUB_TOKEN": "your_github_token_if_needed"
      }
    }
  }
}
```

**Important:**
- Use absolute path (starts with `/` on Mac/Linux or `C:\` on Windows)
- Get your Figma token from https://www.figma.com/settings
- Get Supabase keys from your project `.env` file

### Step 2: Restart Claude Desktop

**Mac:** Cmd+Q to fully quit, then reopen
**Windows:** Close completely from system tray, then reopen

### Step 3: Verify Server Starts

Check Claude Desktop logs (Help → View Logs or check console):

**Expected log output:**
```
Lumiere-Figma MCP Server starting...
Configured for repository: elastic/eui
Using Supabase at: https://oejykyovgwfaxyirtyxv.supabase.co
AI Mode: Component Mapping Only
Lumiere-Figma MCP Server running on stdio
```

**If you see:** `AI Mode: Component Mapping Only`  Mode 1 is active!

### Step 4: Test Component Scanning

In Claude Desktop, type:

```
Scan the EUI repository
```

**Expected Response:**
```
I'll scan the EUI repository and load the components...

[After scanning]
✓ Found XX components from elastic/eui
✓ Loaded into Supabase database

Components include:
- EuiButton
- EuiCard
- EuiPanel
- [etc...]
```

### Step 5: Test Figma Analysis

```
Analyze this Figma design:
https://www.figma.com/design/[your-file-id]/[your-file-name]?node-id=X-Y
```

**Expected Response:**
```
I'll analyze this Figma design and match it to EUI components...

## Design Analysis
- Frame name: [name]
- Elements found: X
- Layout: [flex/grid/auto-layout]

## Matched EUI Components
1. **EuiButton**
   - Use for: [button name]
   - Import: import { EuiButton } from '@elastic/eui'
   - Props: fill={true}, color="primary"

2. **EuiFieldText**
   - Use for: [input name]
   - Import: import { EuiFieldText } from '@elastic/eui'
   ...
```

### Step 6: Test AI Generation (Should Fail)

```
Generate a React component from this Figma design:
https://www.figma.com/design/[your-file-id]/[your-file-name]?node-id=X-Y
```

**Expected Response:**
```
Error: AI code generation requires an API key.

This MCP server is currently configured for Component Mapping Only.

To use AI code generation, add one of the following to your MCP server configuration:
- ANTHROPIC_API_KEY (for Claude AI)
- OPENAI_API_KEY (for OpenAI GPT-4)

See the README for setup instructions.
```

**If you see this error  Mode 1 is working correctly!**

---

## Testing Mode 2: With Anthropic AI

### Step 1: Add Anthropic API Key

Update your Claude Desktop config, add this line to the `env` section:

```json
"ANTHROPIC_API_KEY": "sk-ant-your-actual-key-here"
```

Get your key from: https://console.anthropic.com/

**Full config example:**
```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_key",
        "ANTHROPIC_API_KEY": "sk-ant-your-key",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui"
      }
    }
  }
}
```

### Step 2: Restart Claude Desktop

Fully quit and reopen.

### Step 3: Verify AI Mode

Check logs for:

```
AI Mode: AI Generation Enabled (Anthropic Claude)
```

**If you see this  Mode 2 is active!**

### Step 4: Test Component Mapping (Still Works)

```
Analyze this Figma design:
https://www.figma.com/design/[your-file-id]/[your-file-name]?node-id=X-Y
```

**Expected:** Same as Mode 1 - component mapping still works!

### Step 5: Test AI Generation (Now Works)

```
Generate a React component from this Figma design:
https://www.figma.com/design/[your-file-id]/[your-file-name]?node-id=X-Y
```

**Expected Response:**
```
I'll generate a React component from your Figma design using AI...

[After ~10-30 seconds]

Here's the generated React component:

```tsx
import React from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <div className="flex flex-col gap-6 p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>

      <input
        type="email"
        placeholder="Email"
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Password"
        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={() => onSubmit?.('', '')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign In
      </button>
    </div>
  );
}
```

**Component Details:**
- AI Model: Anthropic Claude (claude-3-5-sonnet-20241022)
- TypeScript: Yes
- Styling: Tailwind CSS
- Dependencies: react, lucide-react

**Usage Example:**
[usage examples provided]
```

**If you get generated code  Mode 2 is working!**

---

## Testing Mode 3: With OpenAI

### Step 1: Switch to OpenAI Key

Update your Claude Desktop config:

**Remove:**
```json
"ANTHROPIC_API_KEY": "sk-ant-..."
```

**Add:**
```json
"OPENAI_API_KEY": "sk-your-openai-key-here"
```

Get your key from: https://platform.openai.com/api-keys

**Full config example:**
```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/your/project/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_key",
        "OPENAI_API_KEY": "sk-your-key",
        "LUMIERE_REPO_OWNER": "elastic",
        "LUMIERE_REPO_NAME": "eui"
      }
    }
  }
}
```

### Step 2: Restart Claude Desktop

Fully quit and reopen.

### Step 3: Verify AI Mode

Check logs for:

```
AI Mode: AI Generation Enabled (OpenAI GPT-4)
```

**If you see this  Mode 3 is active!**

### Step 4: Test AI Generation

```
Generate a React component from this Figma design:
https://www.figma.com/design/[your-file-id]/[your-file-name]?node-id=X-Y
```

**Expected:** Similar to Mode 2, but the metadata will show:
```
- AI Model: OpenAI (gpt-4o)
```

**If you get generated code  Mode 3 is working!**

---

## Quick Test Commands

### Test Component Mapping (All Modes)

```
1. Scan the EUI repository

2. Analyze this Figma design: [URL]

3. Generate an implementation guide for this Figma design: [URL]

4. Get details about the EuiButton component
```

### Test AI Generation (Modes 2 & 3 Only)

```
Generate a React component from this Figma design: [URL]

Options:
- componentName: MyCustomComponent
- includeTypeScript: true
- includeComments: false
```

---

## Troubleshooting Tests

### "Tool not found" or "Server not connected"

**Check:**
1. Did you fully restart Claude Desktop?
2. Is the path in config absolute (not relative)?
3. Does `mcp-server/dist/index.js` exist?
4. Run `cd mcp-server && npm run build` to rebuild

**Test:**
```bash
node /absolute/path/to/mcp-server/dist/index.js
```
Should output help text or error messages.

### "Missing required environment variables"

**Check:**
1. All required fields in config are filled
2. No typos in variable names
3. API keys are valid (not expired)

**Required for all modes:**
- FIGMA_ACCESS_TOKEN
- SUPABASE_URL
- SUPABASE_ANON_KEY
- LUMIERE_REPO_OWNER
- LUMIERE_REPO_NAME

### "Figma API error"

**Check:**
1. FIGMA_ACCESS_TOKEN is valid
2. You have access to the Figma file
3. Figma URL format is correct

**Valid Figma URL format:**
```
https://www.figma.com/design/[FILE_ID]/[FILE_NAME]?node-id=[NODE_ID]
```

### "No components found"

**Check:**
1. LUMIERE_REPO_OWNER and LUMIERE_REPO_NAME are correct
2. Repository exists and is accessible
3. Add GITHUB_TOKEN if repository is private

**Test repository access:**
```
https://github.com/[OWNER]/[REPO]
```

### "AI generation requires an API key"

**This is expected in Mode 1!**

To enable AI:
- Add ANTHROPIC_API_KEY for Mode 2
- Add OPENAI_API_KEY for Mode 3

### AI generation times out

**Check:**
1. API key is valid and has credits
2. Design is not too complex (start simple)
3. Network connection is stable

---

## Test Figma Files

### Simple Test (Recommended First Test)

Create a simple Figma frame with:
- 1 button
- 1 text input
- 1 heading

### Medium Test

Create a Figma frame with:
- Multiple buttons
- Form inputs
- Card layout
- Icons

### Complex Test

Create a Figma frame with:
- Full page layout
- Multiple sections
- Navigation
- Forms and buttons

---

## Expected Behavior Summary

| Test | Mode 1 | Mode 2 | Mode 3 |
|------|--------|--------|--------|
| **Server Starts** |  "Component Mapping Only" |  "Anthropic Claude" |  "OpenAI GPT-4" |
| **Scan Repository** |  Works |  Works |  Works |
| **Analyze Figma** |  Works |  Works |  Works |
| **Generate Guide** |  Works |  Works |  Works |
| **AI Generation** |  Error (expected) |  Works (Claude) |  Works (GPT-4) |

---

## Performance Expectations

### Component Mapping (All Modes)
- Scan repository: 30-60 seconds (first time)
- Analyze design: 2-5 seconds
- Generate guide: 3-10 seconds

### AI Generation (Modes 2 & 3)
- Simple component: 10-20 seconds
- Medium component: 20-30 seconds
- Complex component: 30-45 seconds

---

## Success Criteria

### Mode 1 Success
-  Server starts with "Component Mapping Only"
-  Repository scan completes
-  Figma analysis returns matched components
-  AI generation shows clear error message

### Mode 2 Success
-  Server starts with "Anthropic Claude"
-  Everything from Mode 1 works
-  AI generation produces valid React code
-  Metadata shows "Anthropic Claude" model

### Mode 3 Success
-  Server starts with "OpenAI GPT-4"
-  Everything from Mode 1 works
-  AI generation produces valid React code
-  Metadata shows "OpenAI" model

---

## Next Steps After Testing

1. **Mode 1 works:** You're ready to use component mapping!
2. **Mode 2/3 works:** You can now generate custom components!
3. **Share with team:** Pass along `docs/TEAM_SETUP_GUIDE.md`
4. **Production use:** Start with real designs

---

## Test Checklist

```
Mode 1 (Component Mapping Only)
- [ ] Server starts successfully
- [ ] Shows "Component Mapping Only" mode
- [ ] Scan repository works
- [ ] Analyze Figma works
- [ ] Generate guide works
- [ ] Get component details works
- [ ] AI generation shows error (expected)

Mode 2 (Anthropic)
- [ ] Server starts successfully
- [ ] Shows "Anthropic Claude" mode
- [ ] All Mode 1 features work
- [ ] AI generation produces code
- [ ] Code is valid TypeScript/React
- [ ] Uses Tailwind CSS classes

Mode 3 (OpenAI)
- [ ] Server starts successfully
- [ ] Shows "OpenAI GPT-4" mode
- [ ] All Mode 1 features work
- [ ] AI generation produces code
- [ ] Code is valid TypeScript/React
- [ ] Uses Tailwind CSS classes
```

---

## Got Issues?

1. Check the troubleshooting section above
2. Review `mcp-server/README.md` for detailed docs
3. Verify all environment variables are set
4. Check Claude Desktop logs for errors
5. Test with simple designs first

Happy testing! 
