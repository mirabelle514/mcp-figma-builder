# Configuration Guide: Switch Your Repository and Figma Library

This guide shows you **exactly where to make changes** when you want to use your own component repository and Figma library instead of the default Lumiere/EUI setup.

---

##  What You Can Customize

1. **Component Repository** - The GitHub repo containing your design system components
2. **Figma Library** - Your Figma design system file
3. **Component Scanning Logic** - How components are extracted from your repo
4. **AI Provider** - Which AI service to use (Anthropic, OpenAI, or none)

---

##  Configuration Locations

### Location 1: Claude Desktop Config (Required)

**File:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
**File:** `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

This is where you configure:
- Which repository to scan
- Which Figma library to use
- API keys for all services

---

##  Step-by-Step Configuration

### Step 1: Change Component Repository

**In Claude Desktop config, update these variables:**

```json
{
  "mcpServers": {
    "eui-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "EUI_REPO_OWNER": "YOUR_GITHUB_ORG",
        "EUI_REPO_NAME": "YOUR_DESIGN_SYSTEM_REPO"
      }
    }
  }
}
```

**Examples:**

**Material-UI:**
```json
"EUI_REPO_OWNER": "mui",
"EUI_REPO_NAME": "material-ui"
```

**Ant Design:**
```json
"EUI_REPO_OWNER": "ant-design",
"EUI_REPO_NAME": "ant-design"
```

**Your Custom Repo:**
```json
"EUI_REPO_OWNER": "your-company",
"EUI_REPO_NAME": "your-design-system"
```

**Private Repos:** Add a GitHub token:
```json
"GITHUB_TOKEN": "ghp_your_github_token_here"
```

Get token from: https://github.com/settings/tokens

---

### Step 2: Change Figma Library (Optional)

The Figma library doesn't need configuration! You just:

1. **Use your own Figma files** - Provide any Figma URL when testing
2. **Figma access token** - Your token works with any Figma file you have access to

```json
"FIGMA_ACCESS_TOKEN": "figd_your_figma_token"
```

Get token from: https://www.figma.com/settings (Personal access tokens section)

The token gives access to:
- Any files in your Figma account
- Any files in teams you belong to
- Any files shared with you

**No additional configuration needed!**

---

### Step 3: Complete Configuration Example

Here's a complete example for switching to Material-UI:

```json
{
  "mcpServers": {
    "material-figma": {
      "command": "node",
      "args": ["/Users/you/projects/eui-figma-mcp/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_ABC123_your_token",
        "SUPABASE_URL": "https://oejykyovgwfaxyirtyxv.supabase.co",
        "SUPABASE_ANON_KEY": "eyJ...your_key",
        "EUI_REPO_OWNER": "mui",
        "EUI_REPO_NAME": "material-ui",
        "GITHUB_TOKEN": "ghp_optional_if_private",
        "ANTHROPIC_API_KEY": "sk-ant-optional_for_ai"
      }
    }
  }
}
```

---

##  Component Repository Structure

Your repository should have one of these structures:

### Structure 1: `/src/components/` (Common)
```
your-repo/
├── src/
│   └── components/
│       ├── Button/
│       │   └── Button.tsx
│       ├── Input/
│       │   └── Input.tsx
│       └── Card/
│           └── Card.tsx
```

### Structure 2: `/packages/` (Monorepo)
```
your-repo/
├── packages/
│   ├── button/
│   │   └── src/
│   │       └── Button.tsx
│   ├── input/
│   │   └── src/
│   │       └── Input.tsx
```

### Structure 3: Root Level
```
your-repo/
├── Button.tsx
├── Input.tsx
└── Card.tsx
```

**The scanner will automatically find components in any of these structures!**

---

##  Component Scanning Logic

### Default Behavior

The scanner looks for:
1. **File patterns:** `*.tsx`, `*.ts`, `*.jsx`, `*.js`
2. **Component exports:** `export function ComponentName`, `export const ComponentName`, `export class ComponentName`
3. **Props interfaces:** `interface ComponentNameProps`, `type ComponentNameProps`
4. **Common patterns:** JSX elements, React imports

### Customizing the Scanner

If your components use a different structure, you can customize the scanner:

**File:** `mcp-server/src/services/lumiere-scanner.ts`

**Current detection logic** (lines 150-250):

```typescript
private isReactComponent(content: string, fileName: string): boolean {
  const hasReactImport = /import\s+(?:React|\{[^}]*\})\s+from\s+['"]react['"]/.test(content);
  const hasJSXElements = /<[A-Z][a-zA-Z0-9]*/.test(content);
  const hasExportedFunction = /export\s+(?:default\s+)?(?:function|const|class)\s+[A-Z]/.test(content);

  return (hasReactImport && hasJSXElements) || hasExportedFunction;
}
```

**To customize for your framework:**

```typescript
// Example: Vue.js components
private isVueComponent(content: string, fileName: string): boolean {
  return fileName.endsWith('.vue') && content.includes('<template>');
}

// Example: Svelte components
private isSvelteComponent(content: string, fileName: string): boolean {
  return fileName.endsWith('.svelte') && content.includes('<script>');
}
```

---

##  Figma-Specific Configuration

### Using Your Figma Design System

**No special configuration required!** Just:

1. Make sure your Figma token has access to your files
2. Use your Figma URLs when calling the tool
3. Organize your Figma components with clear names

### Figma URL Format

```
https://www.figma.com/design/[FILE_ID]/[FILE_NAME]?node-id=[NODE_ID]
```

**Examples:**

Single frame:
```
https://www.figma.com/design/ABC123/My-Design-System?node-id=4-38
```

Entire file:
```
https://www.figma.com/design/ABC123/My-Design-System
```

### Figma Best Practices

For best component matching:

1. **Name Figma layers clearly:**
   - "Login Button" → Will match `Button` component
   - "Email Input" → Will match `Input` or `TextField` component
   - "User Card" → Will match `Card` component

2. **Use Figma components:**
   - Component instances are easier to detect
   - Variants map to component props

3. **Group related elements:**
   - Use frames for logical groupings
   - Use auto-layout for flex layouts

---

##  Switching Between Configurations

You can have multiple configurations for different projects:

```json
{
  "mcpServers": {
    "eui-project": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "EUI_REPO_OWNER": "elastic",
        "EUI_REPO_NAME": "eui"
      }
    },
    "material-ui-project": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "EUI_REPO_OWNER": "mui",
        "EUI_REPO_NAME": "material-ui"
      }
    },
    "custom-project": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "EUI_REPO_OWNER": "your-company",
        "EUI_REPO_NAME": "design-system"
      }
    }
  }
}
```

**Switch by:** Commenting out/uncommenting the config you want to use, then restart Claude Desktop.

---

##  Verification Checklist

After changing configuration:

- [ ] Updated `EUI_REPO_OWNER` to your org/username
- [ ] Updated `EUI_REPO_NAME` to your repo name
- [ ] Added `GITHUB_TOKEN` if repo is private
- [ ] Updated `FIGMA_ACCESS_TOKEN` if using different account
- [ ] Saved Claude Desktop config file
- [ ] Restarted Claude Desktop completely
- [ ] Tested with: "Scan the [your repo name] repository"
- [ ] Verified components were found
- [ ] Tested with your Figma URL

---

##  Testing Your Configuration

### Test 1: Verify Repository Access

In Claude Desktop:
```
Scan the [your-repo-name] repository
```

**Expected:** List of components found in your repo

### Test 2: Verify Figma Access

In Claude Desktop:
```
Analyze this Figma design: [your-figma-url]
```

**Expected:** Design analysis with matched components

### Test 3: Verify AI Generation (if enabled)

In Claude Desktop:
```
Generate a React component from this Figma design: [your-figma-url]
```

**Expected:** Generated code using your component library

---

## 🐛 Troubleshooting

### "Failed to fetch repository"

**Check:**
- Repository owner/name are correct
- Repository is public OR you added GITHUB_TOKEN
- GitHub token has repo access permission

**Test access:**
```
https://github.com/[OWNER]/[REPO]
```

### "No components found"

**Check:**
- Repository contains React components
- Files are in common locations (/src, /packages, /components)
- Components export properly

**Manual test:**
```bash
git clone https://github.com/[OWNER]/[REPO]
cd [REPO]
find . -name "*.tsx" -o -name "*.jsx"
```

### "Figma API error"

**Check:**
- FIGMA_ACCESS_TOKEN is valid
- You have access to the Figma file
- Figma URL format is correct

**Test token:**
Visit https://www.figma.com/api/v1/me with your token as bearer auth

### "Component library not used in generated code"

**Check:**
- Repository scan completed successfully
- Components are stored in database
- AI generation mode is enabled (Mode 2 or 3)

**Verify database:**
In Claude Desktop:
```
Get details about the [ComponentName] component
```

---

##  Quick Reference

### Required Environment Variables

```json
"FIGMA_ACCESS_TOKEN": "figd_...",        // Required
"SUPABASE_URL": "https://...",           // Required
"SUPABASE_ANON_KEY": "eyJ...",           // Required
"EUI_REPO_OWNER": "your-org",        // Required
"EUI_REPO_NAME": "your-repo",        // Required
"GITHUB_TOKEN": "ghp_...",               // Optional (private repos)
"ANTHROPIC_API_KEY": "sk-ant-...",       // Optional (AI Mode 2)
"OPENAI_API_KEY": "sk-..."               // Optional (AI Mode 3)
```

### Where to Get Keys

| Key | Where to Get It |
|-----|----------------|
| FIGMA_ACCESS_TOKEN | https://www.figma.com/settings |
| SUPABASE_URL | Project `.env` file |
| SUPABASE_ANON_KEY | Project `.env` file |
| GITHUB_TOKEN | https://github.com/settings/tokens |
| ANTHROPIC_API_KEY | https://console.anthropic.com/ |
| OPENAI_API_KEY | https://platform.openai.com/api-keys |

---

##  Pro Tips

1. **Start with public repos** - Test with public repos first, add private access later

2. **Use descriptive names** - Clear component names in both code and Figma help matching

3. **Test incrementally** - Change one thing at a time and test

4. **Keep multiple configs** - Set up configs for each project you work on

5. **Document your setup** - Note any custom scanner changes for your team

---

##  Examples for Popular Design Systems

### Material-UI

```json
"EUI_REPO_OWNER": "mui",
"EUI_REPO_NAME": "material-ui"
```

Components found: Button, TextField, Card, Dialog, etc.

### Ant Design

```json
"EUI_REPO_OWNER": "ant-design",
"EUI_REPO_NAME": "ant-design"
```

Components found: Button, Input, Card, Modal, etc.

### Chakra UI

```json
"EUI_REPO_OWNER": "chakra-ui",
"EUI_REPO_NAME": "chakra-ui"
```

Components found: Button, Input, Box, Flex, etc.

### Your Custom System

```json
"EUI_REPO_OWNER": "your-company",
"EUI_REPO_NAME": "design-system"
```

Components found: Whatever you've built!

---

##  Next Steps

1.  Update your Claude Desktop config
2.  Restart Claude Desktop
3.  Test repository scanning
4.  Test Figma analysis
5.  Generate your first component!

**Remember:** After ANY config change, you MUST fully restart Claude Desktop (Quit, not just close window).

---

## Need Help?

- **Config not working?** Check the troubleshooting section above
- **Custom repo structure?** See "Component Scanning Logic"
- **Different framework?** Customize `lumiere-scanner.ts`
- **Team setup?** See `docs/TEAM_SETUP_GUIDE.md`
