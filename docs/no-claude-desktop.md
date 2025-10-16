# Using Without Claude Desktop

Yes! You can use this system **without Claude Desktop** in two ways:

## Option 1: VS Code + Continue Extension  Recommended

**Works exactly like Claude Desktop but inside VS Code.**

### Setup

1. **Install Continue Extension**
   - Open VS Code
   - Extensions → Search "Continue"
   - Install it

2. **Configure Continue**
   - Open Command Palette (Cmd/Ctrl+Shift+P)
   - "Continue: Open config.json"
   - Add configuration (see `VSCODE_SETUP.md`)

3. **Use It**
   ```
   // In Continue chat (Cmd+L):

   Generate a React component from this Figma design:
   https://www.figma.com/design/ABC/Design?node-id=1-2
   ```

**Benefits:**
-  Integrated into VS Code
-  Can insert code directly
-  Full project context
-  Same AI-powered generation

**See:** `VSCODE_SETUP.md` for detailed setup

---

## Option 2: Direct CLI Script ⚡ Fastest

**Use a simple command-line script - no AI assistant needed!**

### Setup

1. **Add your API keys to `.env` file:**
   ```bash
   # Already there:
   SUPABASE_URL=https://oejykyovgwfaxyirtyxv.supabase.co
   SUPABASE_ANON_KEY=your_key

   # Add these:
   FIGMA_ACCESS_TOKEN=figd_your_token
   ANTHROPIC_API_KEY=sk-ant-your_key
   ```

2. **Make script executable:**
   ```bash
   chmod +x generate-component.js
   ```

### Usage

**Basic:**
```bash
node generate-component.js "https://www.figma.com/design/ABC/Design?node-id=1-2"
```

**With custom name:**
```bash
node generate-component.js "https://www.figma.com/design/ABC/Design?node-id=1-2" MyButton
```

### What It Does

1.  Fetches your Figma design
2.  Analyzes layout and styles
3.  Generates React component with AI
4.  Stores in database
5.  Prints code to terminal
6.  Saves to `./generated/ComponentName.tsx`

### Example Output

```bash
$ node generate-component.js "https://figma.com/..."

 Starting React component generation...

📥 Fetching Figma design...
✓ Fetched: Button Component

 Storing design in database...
✓ Design stored (ID: abc-123)

 Analyzing design...
✓ Found 5 elements
✓ Complexity: simple
✓ Colors: 3
✓ Spacing values: 4

 Generating React component with AI...
✓ Generated: ButtonComponent

 Storing generated component...
✓ Component stored (ID: def-456)

════════════════════════════════════════════════════════════
 GENERATED COMPONENT
════════════════════════════════════════════════════════════

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

════════════════════════════════════════════════════════════
 GENERATION SUMMARY
════════════════════════════════════════════════════════════
Component Name: ButtonComponent
Generation Time: 12345ms
AI Model: claude-3-5-sonnet-20241022
Complexity: simple
Dependencies: react, lucide-react

 Next steps:
1. Copy the code above
2. Save to: src/components/ButtonComponent.tsx
3. Install dependencies: npm install react lucide-react
4. Import and use in your app!

 Saved to: ./generated/ButtonComponent.tsx
```

### Benefits

-  No AI assistant needed
-  Works from command line
-  Saves to file automatically
-  Fast and direct
-  Can be automated/scripted

---

## Comparison

| Feature | Claude Desktop | VS Code + Continue | CLI Script |
|---------|---------------|-------------------|-----------|
| **Setup** | Medium | Easy | Easiest |
| **Usage** | Chat interface | Chat in VS Code | Command line |
| **AI Assistant** | Yes | Yes | No (direct) |
| **Code Insertion** | Copy/paste | Direct insert | Auto-saves |
| **Automation** | No | No | Yes |
| **Cost** | API calls | API calls | API calls |
| **Best For** | General use | Developers | Scripts/Batch |

---

## Which Should You Choose?

### Choose **VS Code + Continue** if:
-  You use VS Code
-  Want IDE integration
-  Like chat-based workflow
-  Want to ask questions about code

### Choose **CLI Script** if:
-  Want fastest/simplest solution
-  Don't want AI assistant overhead
-  Want to automate generation
-  Prefer command-line tools
-  Want to script batch operations

---

## Requirements (Both Options)

### API Keys Needed:
1. **Figma Access Token**
   - Get from: https://www.figma.com/developers/api
   - Free, takes 1 minute

2. **Anthropic API Key**
   - Get from: https://console.anthropic.com/
   - ~$0.01-0.02 per component

3. **Supabase Keys**
   - Already in your `.env` file
   - Already configured

### System Requirements:
- Node.js 18+
- Internet connection
- Access to Figma files

---

## Cost

**Same for all options:**
- Continue extension: Free
- CLI script: Free
- Anthropic API: ~$0.01-0.02 per generation
- Figma API: Free

---

## Examples

### CLI Script Examples

**Generate a button:**
```bash
node generate-component.js "https://figma.com/design/ABC?node-id=1-2" Button
```

**Generate a card:**
```bash
node generate-component.js "https://figma.com/design/ABC?node-id=2-3" UserCard
```

**Generate multiple components (bash loop):**
```bash
# URLs in a file
cat figma-urls.txt | while read url; do
  node generate-component.js "$url"
done
```

**With custom naming:**
```bash
node generate-component.js "$FIGMA_URL" "LoginForm"
node generate-component.js "$FIGMA_URL" "SignupModal"
node generate-component.js "$FIGMA_URL" "DashboardCard"
```

---

## Automation Examples

### Batch Generate Components

```bash
#!/bin/bash
# generate-all.sh

# List of Figma URLs and component names
declare -A components=(
  ["Button"]="https://figma.com/design/ABC?node-id=1-2"
  ["Card"]="https://figma.com/design/ABC?node-id=2-3"
  ["Modal"]="https://figma.com/design/ABC?node-id=3-4"
)

for name in "${!components[@]}"; do
  echo "Generating $name..."
  node generate-component.js "${components[$name]}" "$name"
done

echo "All components generated!"
```

### CI/CD Integration

```yaml
# .github/workflows/generate-components.yml
name: Generate Components from Figma

on:
  workflow_dispatch:
    inputs:
      figma_url:
        description: 'Figma URL'
        required: true

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node generate-component.js "${{ github.event.inputs.figma_url }}"
        env:
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## Troubleshooting

### "Cannot find module"
```bash
cd /tmp/cc-agent/58675574/project
npm install
cd mcp-server && npm install && npm run build
```

### "Missing environment variable"
Add to `.env` file:
```
FIGMA_ACCESS_TOKEN=figd_...
ANTHROPIC_API_KEY=sk-ant-...
```

### "Figma API error"
- Check token is valid
- Verify you have access to the file
- Make sure URL format is correct

---

## Summary

**You have TWO great options to use without Claude Desktop:**

1. **VS Code + Continue** - Chat-based, IDE-integrated
2. **CLI Script** - Direct, fast, automatable

Both use the same underlying system and produce the same quality results!

**Next Steps:**
- For VS Code: See `VSCODE_SETUP.md`
- For CLI: Add API keys to `.env` and run `node generate-component.js [url]`
