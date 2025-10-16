# Quick Reference Card

##  What This Tool Does

Takes Figma designs → Generates React code using **YOUR actual component library** (EUI, Material-UI, etc.)

**NOT generic Tailwind CSS**  **Your design system components**

---

##  NEW: Visual Setup Wizard!

**Easiest way to get started:**

```bash
git clone <repo-url>
npm install
npm run dev
# Open http://localhost:5173
```

**Interactive wizard walks you through:**
- Choosing AI mode
- Configuring repository
- Adding API keys
- Generating Claude Desktop config

**No config file editing needed!** See [`docs/SETUP_WIZARD.md`](docs/SETUP_WIZARD.md)

---

##  Manual Configuration (Alternative)

### File Location
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Required Fields
```json
{
  "mcpServers": {
    "component-figma": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_...",
        "SUPABASE_URL": "https://...",
        "SUPABASE_ANON_KEY": "eyJ...",
        "EUI_REPO_OWNER": "elastic",
        "EUI_REPO_NAME": "eui"
      }
    }
  }
}
```

### Change Repository (Your Own Component Library)
```json
"EUI_REPO_OWNER": "your-company",
"EUI_REPO_NAME": "your-design-system"
```

---

##  Commands

### In Claude Desktop

**Scan Repository (First Time):**
```
Scan the eui repository
```

**Analyze Design:**
```
Analyze this Figma design: [URL]
```

**Generate Component (Uses Your Components!):**
```
Generate a React component from this Figma design: [URL]
```

**Get Component Details:**
```
Get details about the EuiButton component
```

---

##  What You Get

### Input
```
Figma URL: https://www.figma.com/design/ABC123/Login?node-id=4-38
```

### Output
```tsx
import { EuiButton, EuiFieldText, EuiForm } from '@elastic/eui';

export function LoginForm() {
  return (
    <EuiForm>
      <EuiFieldText placeholder="Email" />
      <EuiButton fill color="primary">Sign In</EuiButton>
    </EuiForm>
  );
}
```

**Uses YOUR components!** Not `<button className="...">` 

---

##  Where to Get API Keys

| Key | Where | Required? |
|-----|-------|-----------|
| FIGMA_ACCESS_TOKEN | https://www.figma.com/settings | Yes |
| SUPABASE_URL | Project `.env` file | Yes |
| SUPABASE_ANON_KEY | Project `.env` file | Yes |
| ANTHROPIC_API_KEY | https://console.anthropic.com/ | Optional (AI) |
| OPENAI_API_KEY | https://platform.openai.com/api-keys | Optional (AI) |
| GITHUB_TOKEN | https://github.com/settings/tokens | Optional (private repos) |

---

##  Supported Component Libraries

- **Elastic EUI** (default)
- **Material-UI** (`mui` / `material-ui`)
- **Ant Design** (`ant-design` / `ant-design`)
- **Chakra UI** (`chakra-ui` / `chakra-ui`)
- **Your Custom Library** (any public/private repo)

Just change `EUI_REPO_OWNER` and `EUI_REPO_NAME`!

---

##  Build & Start

```bash
# One-time build
cd mcp-server
npm install
npm run build

# Restart Claude Desktop
# Mac: Cmd+Q, then reopen
# Windows: Close from system tray, then reopen
```

---

##  Documentation

| Guide | Purpose |
|-------|---------|
| **README.md** | Overview & examples |
| **CHANGES_SUMMARY.md** | What changed & why |
| **docs/CONFIGURATION.md** | Switch repos/Figma |
| **HOW_TO_TEST.md** | Testing guide |
| **docs/VISUAL_TEST_GUIDE.md** | Step-by-step testing |

---

##  Quick Test

1. Build: `cd mcp-server && npm run build`
2. Configure Claude Desktop (see above)
3. Restart Claude Desktop completely
4. In Claude: `Scan the eui repository`
5. Wait 30-60 seconds
6. In Claude: `Generate a React component from [YOUR_FIGMA_URL]`
7. Check output uses `import { Eui... } from '@elastic/eui'`

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Tool not found" | Restart Claude Desktop |
| "Missing env variables" | Check all fields in config |
| "No components found" | Verify repo owner/name |
| Generic HTML output | Re-scan repository |
| Wrong components | Update repo config, restart |

---

##  Pro Tips

1. **Start simple** - Test with 2-3 element designs first
2. **Clear naming** - Name Figma layers clearly ("Login Button", "Email Input")
3. **Use auto-layout** - Figma auto-layout converts well
4. **One repo at a time** - Switch configs, restart Claude
5. **Re-scan after switching** - Always re-scan when changing repos

---

##  Example: Switch to Material-UI

1. Update config:
```json
"EUI_REPO_OWNER": "mui",
"EUI_REPO_NAME": "material-ui"
```

2. Restart Claude Desktop

3. Scan:
```
Scan the material-ui repository
```

4. Generate:
```
Generate a React component from [FIGMA_URL]
```

5. Output will use:
```tsx
import { Button, TextField } from '@mui/material';
```

---

## ⚡ Speed Reference

| Action | Time |
|--------|------|
| Scan repository | 30-60 sec (first time) |
| Analyze design | 3-10 sec |
| Generate component | 10-30 sec (with AI) |
| Component mapping | 3-10 sec (no AI) |

---

##  Need Help?

1. Check `docs/CONFIGURATION.md` for repo setup
2. Check `HOW_TO_TEST.md` for testing
3. Check `CHANGES_SUMMARY.md` for what changed
4. All TypeScript code is correct (verified)
5. Build works when network is stable

---

**Remember:** After ANY config change, **fully restart Claude Desktop** (Quit, not just close)!

 **Ready to generate components with YOUR design system!**
