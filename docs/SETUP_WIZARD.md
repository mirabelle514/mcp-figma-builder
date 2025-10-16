# Setup Wizard Guide

##  Overview

The Setup Wizard is an interactive web interface that guides you through configuring the Figma-to-Component tool step by step.

**Instead of manually editing config files, you:**
1. Answer questions in a visual interface
2. Get real-time validation
3. Download a ready-to-use configuration
4. Follow final installation steps

---

##  Starting the Wizard

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

### 4. Open in Browser

```
http://localhost:5173
```

The setup wizard will open automatically!

---

##  Wizard Steps

### Step 1: Choose Your Mode

**Three options:**

**Mode 1: Component Mapping Only ($0)**
- Free forever
- Matches Figma designs to your component library
- Provides implementation guides
- Manual coding required

**Mode 2: AI with Anthropic Claude (~$5-20/project)**
- Everything from Mode 1
- AI generates complete React code
- Uses YOUR actual components
- Claude 3.5 Sonnet

**Mode 3: AI with OpenAI GPT-4 (~$10-30/project)**
- Everything from Mode 1
- AI generates complete React code
- Uses YOUR actual components
- GPT-4o

**Choose based on:**
- Budget (Mode 1 is free)
- Preferred AI provider (Claude vs GPT-4)
- Need for code generation (vs just guidance)

---

### Step 2: Configure Repository

**What you need:**
- GitHub repository owner (e.g., `elastic`, `mui`, `your-company`)
- Repository name (e.g., `eui`, `material-ui`, `design-system`)
- GitHub token (optional - only for private repos)

**Popular examples:**
- Elastic EUI: `elastic` / `eui`
- Material-UI: `mui` / `material-ui`
- Ant Design: `ant-design` / `ant-design`
- Chakra UI: `chakra-ui` / `chakra-ui`

**For private repos:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy and paste into wizard

---

### Step 3: Figma Access Token

**How to get it:**
1. Go to https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Give it a name (e.g., "Component Generator")
5. Copy the token
6. Paste into wizard

**Permissions:**
- Token gives access to all Figma files you can view
- Works with personal files and team files
- Can be revoked anytime from Figma settings

---

### Step 4: Database Configuration

**Auto-populated!**

The wizard automatically loads Supabase credentials from your `.env` file:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If these are missing, you'll need to add them to your `.env` file first.

**Where to get them:**
- Check your project's `.env` file
- Or get from Supabase project settings

---

### Step 5: AI Provider Setup

**If Mode 1 (No AI):**
- No configuration needed
- Skip this step

**If Mode 2 (Anthropic):**
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys
4. Create new key
5. Copy and paste into wizard

**Pricing:** ~$0.10-0.50 per component

**If Mode 3 (OpenAI):**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create new secret key
4. Copy and paste into wizard

**Pricing:** ~$0.15-0.60 per component

---

### Step 6: Generate Configuration

**What happens:**
1. Wizard generates Claude Desktop config JSON
2. You can copy to clipboard OR download as file
3. Config includes all your settings

**Important:** Update the path!
- The config includes a placeholder path
- Replace with your actual project path
- Example: `/Users/you/projects/figma-tool/mcp-server/dist/index.js`

**Two ways to use config:**

**Option A: Copy & Paste**
1. Click "Copy to Clipboard"
2. Open Claude Desktop config:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
3. Paste the content
4. Update the path
5. Save

**Option B: Download File**
1. Click "Download File"
2. Open downloaded `claude_desktop_config.json`
3. Update the path
4. Copy to Claude Desktop location (see above)

---

### Step 7: Complete Setup

**Final steps:**

**1. Build MCP Server**
```bash
cd mcp-server
npm install
npm run build
```

**2. Install Configuration**
- Place config file at correct location (see Step 6)
- Make sure path is correct

**3. Restart Claude Desktop**
- Completely quit Claude Desktop (Cmd+Q on Mac)
- Reopen Claude Desktop
- MCP server will auto-start

**4. Test It!**

In Claude Desktop:
```
Scan the eui repository
```

Wait 30-60 seconds, then:
```
Generate a React component from https://www.figma.com/design/YOUR_URL
```

---

##  Features

### Visual Progress

- See which step you're on
- Completed steps shown in green
- Current step highlighted

### Validation

- Required fields highlighted
- Invalid inputs prevented
- Can't proceed without completing step

### Help & Guidance

- Inline help text for each field
- Links to get API keys
- Examples for common setups
- Troubleshooting tips

### Save Progress

- Progress saved in browser (localStorage)
- Can close and resume later
- No server-side storage needed

---

##  Design

The wizard uses:
- Clean, modern interface
- Step-by-step progression
- Color-coded status indicators
- Responsive design (works on mobile)
- Dark code blocks for config display
- Copy/download buttons for convenience

---

##  Under the Hood

**Technology:**
- React + TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- localStorage for persistence
- No backend required (all client-side)

**Files:**
- `src/components/SetupWizard.tsx` - Main wizard component
- `src/App.tsx` - Renders wizard

---

## 🐛 Troubleshooting

### Wizard Won't Start

**Problem:** `npm run dev` fails

**Solutions:**
1. Make sure you ran `npm install`
2. Check Node.js version (need 16+)
3. Try `rm -rf node_modules && npm install`

### Config Not Working

**Problem:** Claude Desktop doesn't recognize config

**Solutions:**
1. Verify path is absolute (not relative)
2. Check path points to `dist/index.js` (not `src/`)
3. Make sure MCP server is built (`npm run build`)
4. Restart Claude Desktop completely

### API Keys Invalid

**Problem:** "Invalid API key" errors

**Solutions:**
1. Double-check you copied the full key
2. Verify key hasn't expired
3. Check key has correct permissions
4. Generate a new key if needed

---

##  Pro Tips

1. **Save your config** - After downloading, keep a backup of your config file

2. **Use examples** - Click the example repositories to auto-fill common setups

3. **Test incrementally** - Test each API key as you enter it (future feature)

4. **Multiple configs** - You can create different configs for different projects

5. **Private repos** - Generate a read-only GitHub token for security

---

##  Comparison: Wizard vs Manual

| Aspect | Setup Wizard | Manual Config |
|--------|--------------|---------------|
| Time | 5-10 minutes | 15-30 minutes |
| Errors | Validated | Easy to make mistakes |
| Help | Built-in guidance | Need to reference docs |
| Visual | Beautiful UI | Text editor |
| Testing | Coming soon | Manual |
| Recommended for | First-time users | Power users |

---

##  Future Enhancements

Planned features:
- [ ] Live API key testing
- [ ] Component repository preview
- [ ] Figma file browser
- [ ] Connection diagnostics
- [ ] Setup history
- [ ] Export/import configs
- [ ] Team sharing

---

##  Related Documentation

- [`README.md`](../README.md) - Project overview
- [`docs/CONFIGURATION.md`](CONFIGURATION.md) - Manual configuration guide
- [`QUICK_REFERENCE.md`](../QUICK_REFERENCE.md) - Quick command reference
- [`HOW_TO_TEST.md`](../HOW_TO_TEST.md) - Testing guide

---

##  Video Walkthrough

Coming soon: A video walkthrough of the setup wizard!

---

**The setup wizard makes getting started easy!** Just clone, run `npm run dev`, and follow the steps. No config file editing required! 
