# User Guide

Complete guide to using the Figma-to-Component tool from start to finish.

---

##  Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Modes](#understanding-modes)
3. [First-Time Setup](#first-time-setup)
4. [Daily Workflow](#daily-workflow)
5. [Advanced Usage](#advanced-usage)
6. [Tips & Best Practices](#tips--best-practices)
7. [Examples](#examples)

---

##  Quick Start

### 5-Minute Setup

**1. Clone and install:**
```bash
git clone https://github.com/mirabelle514/mcp-figma-builder
cd mcp-figma-builder
npm install
```

**2. Run setup wizard:**
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

**3. Follow the wizard:**
- Choose your mode
- Enter API keys
- Configure repository
- Download config file

**4. Install and test:**
- Place config in Claude Desktop folder
- Restart Claude Desktop
- Try: `Scan the eui repository`

**Done!** 

---

##  Understanding Modes

### Mode 1: Component Mapping Only (Free)

**What it does:**
- Scans your component library
- Analyzes Figma designs
- Suggests which components to use
- Provides implementation guidance

**What it doesn't do:**
- Generate actual code
- Requires manual coding

**Best for:**
- Learning your design system
- Getting recommendations
- Budget-conscious teams
- Educational purposes

**Example workflow:**
```
You: Analyze this Figma design: [URL]

Claude: This design uses:
- Header: Use EuiHeader with EuiHeaderSection
- Button: Use EuiButton with fill="primary"
- Card: Use EuiCard with layout="horizontal"
[Detailed implementation guide]

You: [Write code manually based on guidance]
```

---

### Mode 2: AI with Anthropic Claude (~$5-20/project)

**What it does:**
- Everything from Mode 1
- **Generates complete React code**
- Uses YOUR component library
- Powered by Claude 3.5 Sonnet

**Best for:**
- Production applications
- High-quality code generation
- Complex components
- Teams wanting best AI performance

**Pricing:**
- ~$0.10-0.50 per component
- ~$5-20 for typical project
- Pay-as-you-go (no subscription)

**Example workflow:**
```
You: Generate a React component from this Figma design: [URL]

Claude: [Generates complete TypeScript code]
import { EuiButton, EuiCard } from '@elastic/eui';
...
[Full working component]

You: [Copy and use code directly]
```

---

### Mode 3: AI with OpenAI GPT-4 (~$10-30/project)

**What it does:**
- Everything from Mode 1
- **Generates complete React code**
- Uses YOUR component library
- Powered by GPT-4o

**Best for:**
- Teams already using OpenAI
- Alternative to Anthropic
- Organizations with OpenAI contracts

**Pricing:**
- ~$0.15-0.60 per component
- ~$10-30 for typical project
- Pay-as-you-go (no subscription)

**Similar to Mode 2, different AI provider.**

---

### Mode 4: Custom AI (Your Pricing)

**What it does:**
- Everything from Modes 2/3
- **Uses YOUR internal AI**
- Full data privacy
- Complete control

**Best for:**
- Enterprises with internal AI (CompanyAI, Azure, etc.)
- Regulated industries (HIPAA, GDPR)
- Companies requiring data sovereignty
- Organizations with Azure OpenAI or self-hosted LLMs

**Pricing:**
- Whatever your internal AI costs
- Often free or flat-rate

**Security:**
- Data never leaves your network
- Full compliance control
- Private infrastructure

**See:** `docs/CUSTOM_AI_PROVIDER.md` for setup.

---

### Which Mode Should I Choose?

| Need | Recommended Mode |
|------|-----------------|
| Zero cost | Mode 1 |
| Best AI quality | Mode 2 (Anthropic) |
| Already using OpenAI | Mode 3 (OpenAI) |
| Data privacy required | Mode 4 (Custom) |
| Learning/education | Mode 1 |
| Production apps | Mode 2 or 3 |
| Enterprise/regulated | Mode 4 |

---

##  First-Time Setup

### Step 1: Gather Credentials

Before starting, collect:

**Required for all modes:**
- [ ] Figma access token
- [ ] Supabase URL and key (from project .env)
- [ ] Component library (e.g., "elastic/eui")

**Required for Mode 2:**
- [ ] Anthropic API key

**Required for Mode 3:**
- [ ] OpenAI API key

**Required for Mode 4:**
- [ ] Your internal AI URL and key

**Optional:**
- [ ] GitHub token (for private repos)

---

### Step 2: Run Setup Wizard

```bash
npm run dev
```

Open http://localhost:5173

**Follow these steps:**

#### Screen 1: Choose Mode
- Click the card for your desired mode
- Read the description
- Note the pricing
- Click "Continue"

#### Screen 2: Repository
- Enter GitHub owner (e.g., `elastic`)
- Enter repository name (e.g., `eui`)
- Add GitHub token if private repo
- Click "Continue"

#### Screen 3: Figma Access
- Paste your Figma token
- Click the link if you need to generate one
- Click "Continue"

#### Screen 4: Database
- Auto-loaded from .env
- Verify values are correct
- Click "Continue"

#### Screen 5: AI Provider
- **Mode 1:** No configuration needed
- **Mode 2:** Enter Anthropic API key
- **Mode 3:** Enter OpenAI API key
- **Mode 4:** Enter custom AI details
- Click "Continue"

#### Screen 6: Generate Config
- Review the generated configuration
- Click "Copy to Clipboard" OR "Download File"
- **Important:** Note the path placeholder
- Click "Finish"

#### Screen 7: Complete
- Follow the final instructions
- Build MCP server
- Install config file
- Restart Claude Desktop

---

### Step 3: Build MCP Server

```bash
cd mcp-server
npm install
npm run build
```

**Should see:**
```
✓ dist/index.js created
```

---

### Step 4: Install Config

**Get the correct path:**
```bash
pwd
# Copy this path
# Example: /Users/yourname/projects/figma-tool
```

**Edit config file:**

1. **Open config you downloaded**
2. **Find this line:**
   ```json
   "args": ["/absolute/path/to/project/mcp-server/dist/index.js"]
   ```
3. **Replace with your actual path:**
   ```json
   "args": ["/Users/yourname/projects/figma-tool/mcp-server/dist/index.js"]
   ```
4. **Save the file**

**Install config:**

macOS:
```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/
```

Windows:
```cmd
copy claude_desktop_config.json %APPDATA%\Claude\
```

---

### Step 5: Restart Claude Desktop

**Important:** Must fully quit, not just close window.

**macOS:**
```
Cmd + Q
(Then reopen Claude Desktop)
```

**Windows:**
```
Right-click taskbar icon → Exit
(Then reopen Claude Desktop)
```

**Verify it worked:**
- Look for hammer icon (🔨) in Claude Desktop
- Should appear in bottom-left area

---

##  Daily Workflow

### Typical Component Generation Flow

**1. Scan Repository (First Time or When Updated)**

```
Scan the eui repository
```

**What happens:**
- Analyzes component library
- Indexes all components
- Stores in database
- Takes 1-2 minutes for large repos

**When to do:**
- First time using tool
- After component library updates
- When switching repositories

---

**2. Analyze Design (Optional)**

```
Analyze this Figma design: https://www.figma.com/file/ABC123/MyDesign
```

**What happens:**
- Examines Figma design structure
- Identifies UI patterns
- Suggests matching components
- Provides implementation guidance

**Best for:**
- Understanding complex designs
- Getting recommendations
- Planning implementation

---

**3. Generate Component (Modes 2/3/4 Only)**

```
Generate a React component from this Figma design:
https://www.figma.com/file/ABC123/MyDesign?node-id=1-2
```

**What happens:**
- Analyzes Figma design
- Fetches available components from database
- Generates complete React/TypeScript code
- Uses YOUR component library

**Result:**
- Complete `.tsx` file
- TypeScript interfaces
- Correct imports
- Production-ready code

---

**4. Get Component Details**

```
Get details about the EuiButton component
```

**What happens:**
- Searches database
- Returns component documentation
- Shows props and usage
- Provides examples

**Best for:**
- Learning components
- Checking prop names
- Understanding usage

---

### Pro Workflow Tips

**Batch analyze before generating:**
```
First, analyze these three Figma designs:
1. [URL1]
2. [URL2]
3. [URL3]

Then generate components for each.
```

**Request specific components:**
```
Generate a React component from [URL]

Requirements:
- Use EuiFlexGroup for layout
- Use EuiCard for the main container
- Use EuiButton with color="primary" for the CTA
- Make it responsive
```

**Iterate on results:**
```
[After first generation]

Regenerate but:
- Add error handling
- Make the loading state more polished
- Add TypeScript strict mode types
```

---

##  Advanced Usage

### Custom Component Requests

**Specific styling:**
```
Generate from [URL] with:
- Mobile-first responsive design
- Dark mode support using EUI theme
- Accessibility ARIA labels
```

**Multiple variants:**
```
Generate three variants of [URL]:
1. Desktop version
2. Tablet version
3. Mobile version
```

**With state management:**
```
Generate from [URL] including:
- React hooks for state
- Form validation
- Error handling
```

---

### Working with Complex Designs

**Break into sections:**
```
From [URL], generate just the header section
(Then repeat for other sections)
```

**Layer by layer:**
```
1. Generate the layout structure from [URL]
2. Then add the interactive elements
3. Finally add the styling details
```

---

### Using with Different Repositories

**Switch repositories:**

Edit config file:
```json
"REPO_OWNER": "mui",
"REPO_NAME": "material-ui"
```

Restart Claude Desktop, then:
```
Scan the material-ui repository
```

---

### Testing Generated Code

**1. Copy generated code**

**2. Create new file:**
```bash
touch src/components/GeneratedComponent.tsx
```

**3. Paste code**

**4. Install dependencies if needed:**
```bash
npm install @elastic/eui  # or your component library
```

**5. Import and use:**
```tsx
import { GeneratedComponent } from './components/GeneratedComponent';

function App() {
  return <GeneratedComponent />;
}
```

**6. Test in browser:**
```bash
npm run dev
```

---

##  Tips & Best Practices

### For Best Results

**1. Scan first, generate second**
```
 Good:
1. Scan the eui repository
2. [Wait for completion]
3. Generate component from [URL]

 Bad:
1. Generate component from [URL]
   (Without scanning first)
```

**2. Use specific Figma URLs**
```
 Good:
https://www.figma.com/file/ABC/Name?node-id=1-2
(Specific component/frame)

 Less good:
https://www.figma.com/file/ABC/Name
(Entire file - may be too large)
```

**3. Be specific in requests**
```
 Good:
Generate from [URL]
Use EuiButton for the primary action
Make it responsive for mobile
Add loading states

 Less good:
Generate from [URL]
(No specific requirements)
```

**4. Review and refine**
- Generated code is a starting point
- Review for your specific needs
- Customize as needed
- Test thoroughly

---

### Performance Tips

**Scanning large repos:**
- Takes 2-5 minutes for 10,000+ files
- Be patient, don't interrupt
- Only need to scan once

**Generating complex components:**
- May take 30-60 seconds
- Anthropic (Mode 2) typically faster than OpenAI (Mode 3)
- Custom AI (Mode 4) speed depends on your infrastructure

**Rate limits:**
- Anthropic: 1000 requests/day (default)
- OpenAI: Depends on your tier
- Custom AI: Your limits

---

### Cost Optimization

**Mode 2/3 users:**

**Minimize costs:**
1. Use Mode 1 for initial exploration
2. Generate only when ready
3. Batch similar components
4. Reuse generated patterns

**Estimate costs:**
- Simple component: $0.10-0.20
- Medium component: $0.20-0.40
- Complex component: $0.40-0.60

**Typical project:**
- 10-20 components: $5-10
- 20-50 components: $10-20
- 50+ components: $20-30+

---

### Quality Tips

**For better generated code:**

1. **Clean Figma designs**
   - Organized layers
   - Named components
   - Consistent spacing

2. **Specific requests**
   - Mention component library explicitly
   - Specify responsive behavior
   - Request TypeScript types

3. **Iterate**
   - First generation may not be perfect
   - Ask for refinements
   - Claude learns from context

4. **Validate**
   - Check imports are correct
   - Verify prop types
   - Test in your app

---

##  Examples

### Example 1: Simple Button

**Figma design:** Button with text "Click Me" and primary color

**Command:**
```
Generate a React component from:
https://www.figma.com/file/ABC/Buttons?node-id=1-2
```

**Result:**
```tsx
import React from 'react';
import { EuiButton } from '@elastic/eui';

export interface ClickMeButtonProps {
  onClick?: () => void;
}

export const ClickMeButton: React.FC<ClickMeButtonProps> = ({
  onClick
}) => {
  return (
    <EuiButton
      fill
      color="primary"
      onClick={onClick}
    >
      Click Me
    </EuiButton>
  );
};
```

---

### Example 2: Dashboard Card

**Figma design:** Card with title, description, icon, and action button

**Command:**
```
Generate a React component from:
https://www.figma.com/file/DEF/Dashboard?node-id=5-10

Use EuiCard for the container
Use EuiIcon for the icon
Make it responsive
```

**Result:**
```tsx
import React from 'react';
import { EuiCard, EuiIcon } from '@elastic/eui';

export interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  onAction: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  onAction,
}) => {
  return (
    <EuiCard
      icon={<EuiIcon type={icon} size="xxl" />}
      title={title}
      description={description}
      onClick={onAction}
      layout="horizontal"
    />
  );
};
```

---

### Example 3: Form Section

**Figma design:** Form with name input, email input, and submit button

**Command:**
```
Generate a React component from:
https://www.figma.com/file/GHI/Forms?node-id=12-5

Use EuiForm components
Add form validation
Include error handling
TypeScript strict mode
```

**Result:**
```tsx
import React, { useState } from 'react';
import {
  EuiForm,
  EuiFormRow,
  EuiFieldText,
  EuiButton,
} from '@elastic/eui';

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
}

export interface ContactFormData {
  name: string;
  email: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, email });
    }
  };

  return (
    <EuiForm component="form" onSubmit={handleSubmit}>
      <EuiFormRow
        label="Name"
        isInvalid={!!errors.name}
        error={errors.name}
      >
        <EuiFieldText
          value={name}
          onChange={(e) => setName(e.target.value)}
          isInvalid={!!errors.name}
        />
      </EuiFormRow>

      <EuiFormRow
        label="Email"
        isInvalid={!!errors.email}
        error={errors.email}
      >
        <EuiFieldText
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isInvalid={!!errors.email}
        />
      </EuiFormRow>

      <EuiButton type="submit" fill>
        Submit
      </EuiButton>
    </EuiForm>
  );
};
```

---

##  Common Scenarios

### Scenario 1: New Team Member Onboarding

**Day 1:**
1. Run setup wizard (15 minutes)
2. Scan component library (2 minutes)
3. Try Mode 1 analysis (free, learn the system)

**Day 2-3:**
4. Generate 2-3 simple components (Mode 2/3)
5. Study generated code
6. Learn component library patterns

**Week 1+:**
7. Generate components for actual work
8. Customize as needed
9. Build understanding of design system

---

### Scenario 2: Rapid Prototyping

**Goal:** Create 10 screens in 2 days

**Approach:**
1. **Day 1 Morning:** Scan repo, analyze all Figma designs
2. **Day 1 Afternoon:** Generate core components (layout, nav, cards)
3. **Day 2 Morning:** Generate page-specific components
4. **Day 2 Afternoon:** Assembly, customization, testing

**Estimated cost:** $10-15 (Modes 2/3)
**Time saved:** 8-10 hours vs manual coding

---

### Scenario 3: Design System Migration

**Goal:** Migrate from old components to new design system

**Approach:**
1. Scan new design system repository
2. Analyze existing Figma designs
3. Get component mapping suggestions (Mode 1)
4. Generate new components (Modes 2/3/4)
5. Replace old components incrementally

**Benefits:**
- Clear migration path
- Consistent results
- Faster execution

---

##  Related Documentation

- **Troubleshooting:** `docs/TROUBLESHOOTING.md` - Fix issues
- **Setup Wizard:** `docs/SETUP_WIZARD.md` - Detailed setup
- **Configuration:** `docs/CONFIGURATION.md` - Config options
- **Custom AI:** `docs/CUSTOM_AI_PROVIDER.md` - Mode 4 setup
- **Quick Reference:** `QUICK_REFERENCE.md` - Command cheat sheet

---

##  Learning Resources

### For Beginners

1. Start with **Mode 1** (free)
2. Read through examples above
3. Try analyzing simple designs
4. Study the suggested components
5. Learn your design system

### For Intermediate Users

1. Upgrade to **Mode 2 or 3**
2. Generate simple components first
3. Review and understand code
4. Customize generated results
5. Build your own patterns

### For Advanced Users

1. Use **Mode 4** for enterprises
2. Batch generate components
3. Customize prompts
4. Integrate into CI/CD
5. Train team on best practices

---

**Happy component generating! **
