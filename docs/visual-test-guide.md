# Visual Test Guide: Step-by-Step

This guide shows exactly what to type and what you should see.

---

##  Setup (One Time)

### Step 1: Build

```bash
cd mcp-server
npm install
npm run build
```

**You should see:**
```
✓ compiled successfully
```

### Step 2: Configure Claude Desktop

**macOS:** Open `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** Open `%APPDATA%\Claude\claude_desktop_config.json`

**Paste this** (update with your keys):
```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/Users/you/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_actual_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "your_actual_key",
        "EUI_REPO_OWNER": "elastic",
        "EUI_REPO_NAME": "eui"
      }
    }
  }
}
```

### Step 3: Restart Claude

**Mac:** Cmd+Q, then reopen
**Windows:** Close from system tray, reopen

---

##  Test 1: Component Mapping Only

### What You Type

```
Scan the EUI repository
```

### What You Should See

```
✓ Scanning elastic/eui repository...
✓ Found 120+ components
✓ Loading into database...
✓ Scan complete!

Components loaded:
- EuiButton
- EuiCard
- EuiPanel
- EuiFieldText
- EuiForm
- [and many more...]
```

**Time:** 30-60 seconds

---

### What You Type

```
Analyze this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38
```

### What You Should See

```
I'll analyze this Figma design and match it to EUI components...

## Design Structure
- Frame: "Login Form"
- Layout: Vertical stack (auto-layout)
- Elements: 4 (heading, 2 inputs, 1 button)

## Matched EUI Components

### 1. EuiTitle (or EuiText)
**Use for:** "Welcome Back" heading
**Import:** `import { EuiTitle } from '@elastic/eui';`
**Example:**
```jsx
<EuiTitle size="l">
  <h2>Welcome Back</h2>
</EuiTitle>
```

### 2. EuiFieldText
**Use for:** Email input field
**Import:** `import { EuiFieldText } from '@elastic/eui';`
**Example:**
```jsx
<EuiFieldText
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### 3. EuiFieldPassword
**Use for:** Password input field
**Import:** `import { EuiFieldPassword } from '@elastic/eui';`
**Example:**
```jsx
<EuiFieldPassword
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>
```

### 4. EuiButton
**Use for:** "Sign In" button
**Import:** `import { EuiButton } from '@elastic/eui';`
**Example:**
```jsx
<EuiButton
  fill
  onClick={handleSubmit}
  color="primary"
>
  Sign In
</EuiButton>
```

## Layout Recommendation
Use `EuiForm` and `EuiFormRow` to structure the form with proper spacing.
```

**Time:** 3-10 seconds

---

### What You Type (Should Fail in Mode 1)

```
Generate a React component from this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38
```

### What You Should See

```
Error: AI code generation requires an API key.

This MCP server is currently configured for Component Mapping Only.

To use AI code generation, add one of the following to your MCP server configuration:
- ANTHROPIC_API_KEY (for Claude AI)
- OPENAI_API_KEY (for OpenAI GPT-4)

See the README for setup instructions.
```

** This error means Mode 1 is working correctly!**

---

##  Test 2: Add Anthropic AI

### Update Configuration

Add this line to your Claude config `env` section:
```json
"ANTHROPIC_API_KEY": "sk-ant-your-key-here"
```

Get key from: https://console.anthropic.com/

### Restart Claude Desktop

**Mac:** Cmd+Q, then reopen

### Check Logs (Optional)

Look for:
```
AI Mode: AI Generation Enabled (Anthropic Claude)
```

---

### What You Type

```
Generate a React component from this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38
```

### What You Should See

```
I'll generate a React component from your Figma design using AI...

[Generating... 10-30 seconds]

Here's your generated component:

```tsx
import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
  onForgotPassword?: () => void;
}

export function LoginForm({
  onSubmit,
  onForgotPassword
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(email, password);
  };

  return (
    <div className="flex flex-col gap-6 p-8 bg-white rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-900">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign In
        </button>
      </form>

      {onForgotPassword && (
        <button
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Forgot password?
        </button>
      )}
    </div>
  );
}
```

**Component Metadata:**
- AI Model: Anthropic Claude (claude-3-5-sonnet-20241022)
- TypeScript: Yes
- Styling: Tailwind CSS
- Dependencies: react, lucide-react
- Props Interface: Included
- Accessibility: ARIA labels, keyboard navigation
- Responsive: Mobile-first design

**Usage Example:**
```tsx
import { LoginForm } from './LoginForm';

function App() {
  const handleLogin = (email: string, password: string) => {
    console.log('Login:', email, password);
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      onForgotPassword={() => console.log('Forgot password')}
    />
  );
}
```

**Design Tokens Extracted:**
- Colors: white (#ffffff), blue-600 (#2563eb), gray-900 (#111827)
- Spacing: 1.5rem (gap-6), 2rem (p-8)
- Border Radius: 0.5rem (rounded-lg)
- Typography: 1.5rem/2rem (text-2xl), 600 weight
```

**Time:** 10-30 seconds

---

##  Test 3: Switch to OpenAI

### Update Configuration

**Remove:**
```json
"ANTHROPIC_API_KEY": "sk-ant-..."
```

**Add:**
```json
"OPENAI_API_KEY": "sk-your-openai-key"
```

Get key from: https://platform.openai.com/api-keys

### Restart Claude Desktop

### Check Logs (Optional)

Look for:
```
AI Mode: AI Generation Enabled (OpenAI GPT-4)
```

---

### What You Type

```
Generate a React component from this Figma design:
https://www.figma.com/design/ABC123/Design?node-id=4-38
```

### What You Should See

Similar output to Anthropic, but metadata shows:
```
**Component Metadata:**
- AI Model: OpenAI (gpt-4o)
- [rest same as Anthropic]
```

**Time:** 10-30 seconds

---

##  Comparison of Outputs

### Mode 1: Component Mapping

**Input:** Figma URL
**Output:** List of EUI components to use
**Time:** 3-10 seconds
**Cost:** Free

### Mode 2: Anthropic

**Input:** Figma URL
**Output:** Complete React component code
**Time:** 10-30 seconds
**Cost:** ~$0.01-0.05 per component
**Model:** Claude 3.5 Sonnet

### Mode 3: OpenAI

**Input:** Figma URL
**Output:** Complete React component code
**Time:** 10-30 seconds
**Cost:** ~$0.02-0.10 per component
**Model:** GPT-4o

---

##  Success Indicators

### Mode 1 Working
-  Repository scan completes
-  Shows matched EUI components
-  Provides import statements
-  AI generation shows error message

### Mode 2 Working
-  Everything from Mode 1
-  Generates valid TypeScript/React
-  Uses Tailwind CSS
-  Shows "Anthropic Claude" in metadata

### Mode 3 Working
-  Everything from Mode 1
-  Generates valid TypeScript/React
-  Uses Tailwind CSS
-  Shows "OpenAI" in metadata

---

## 🚫 Common Issues

### Issue: Nothing happens

**Check:**
- Absolute path in config is correct
- `mcp-server/dist/index.js` exists
- Restarted Claude Desktop

### Issue: "Tool not found"

**Fix:** Fully quit Claude Desktop (Cmd+Q), then reopen

### Issue: "Missing environment variables"

**Check:**
- All required fields in config
- No typos in variable names
- Valid API keys

### Issue: AI generation slow

**Normal:** 10-30 seconds is expected
**If longer:** Check network, API key credits

---

##  Quick Test Commands

### All Modes
```
Scan the EUI repository
Analyze this Figma design: [URL]
Get details about the EuiButton component
```

### Modes 2 & 3 Only
```
Generate a React component from this Figma design: [URL]
```

---

##  Notes

- Start with simple designs (1-5 elements)
- Component mapping is instant
- AI generation takes 10-30 seconds
- Generated code needs 15-30% refinement
- All modes include component matching

---

##  What's Next?

1.  Test all three modes
2.  Choose which mode fits your needs
3.  Test with real Figma designs
4.  Share with your team
5.  Document your workflows

See `docs/TEAM_SETUP_GUIDE.md` for team rollout!
