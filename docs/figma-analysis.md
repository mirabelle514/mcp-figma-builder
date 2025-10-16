# Figma Design Analysis: MB-test

**File ID:** FhScFrbbi6hYCvubHQjI9T
**Last Modified:** 2025-10-15T13:08:37Z
**Version:** 2275136174901148546

## Design Structure

### Page: Design (0:1)
Main canvas containing the landing page design

### Main Components

#### 1. Landing Page (1:2)
A complete landing page frame containing:

**Hero Section (4:38)**
- Background color: rgb(175, 212, 226) - Light blue
- Navigation bar with "Lugar" logo and menu items
- Large heading: "A home is built with love and dreams"
- Subheading: "Real estate farm that makes your dreams true"
- Two CTA buttons:
  - "Our projects" (filled dark button)
  - "Contact us" (outlined button)
- Hero image with house photography

**About Section (7:33)**
- White background
- Left side: Image with mask
- Right side content:
  - Heading: "Award winning real estate company in Dubai"
  - Features component with metrics:
    - Previous projects
    - Client info
    - Other feature items

## Design Tokens Extracted

### Colors
- **Primary Background:** rgb(175, 212, 226) / #afd4e2
- **Dark Text/Buttons:** rgb(30, 50, 64) / #1e3240
- **White:** rgb(255, 255, 255) / #ffffff
- **Accent Blue:** rgb(175, 212, 226) / #afd4e2
- **Neutral Gray:** rgb(196, 196, 196) / #c4c4c4

### Typography
- **Font Family:** Mulish
- **Heading Styles:**
  - Hero H1: 90px, Bold (700), 120% line height
  - Section H2: 48px, Bold (700), 120% line height
  - Body: 18px, Regular (400), 120% line height
  - Small: 14px, Regular (400), uppercase for nav

### Layout
- **Page Width:** 1440px
- **Hero Height:** 800px
- **Spacing System:** Based on multiples of 8px
- **Button Padding:** 24px horizontal, 18px vertical

### Components Identified

1. **Navigation Bar**
   - Logo text: "Lugar" (18px, Bold, Uppercase)
   - Menu items: Home, About, Project, Contact (14px, Uppercase)

2. **Buttons** (Two variants)
   - Primary: Filled dark (#1e3240), white text
   - Secondary: Outlined dark, dark text
   - Both: 14px text, padding 24x18px

3. **Hero Component**
   - Large heading (90px)
   - Supporting text (18px)
   - Button group
   - Background image
   - Decorative elements (arrows, highlights)

4. **Feature Card** (Component 7:29)
   - Appears to display metrics/stats
   - Light blue accent color for labels
   - Structured as reusable component

## Recommended React Components

Based on this design, here are the React components to build:

### Core Components
1. `Navbar` - Navigation with logo and menu
2. `Button` - Primary and secondary variants
3. `Hero` - Hero section with heading, text, and CTAs
4. `FeatureCard` - Metric/feature display card
5. `AboutSection` - About section with image and content

### Layout Components
1. `Container` - Max-width container (1440px)
2. `Section` - Section wrapper with consistent spacing

### Design System
- Color palette utilities
- Typography system
- Spacing utilities (8px grid)

## Figma-to-React Mapping Recommendations

| Figma Component | React Component | Props |
|----------------|-----------------|-------|
| Button 1 (4:5) | `<Button variant="primary">` | variant, children, onClick |
| Button 2 (4:35) | `<Button variant="secondary">` | variant, children, onClick |
| Navbar (1:29) | `<Navbar>` | logo, menuItems |
| Hero (4:38) | `<Hero>` | heading, subtitle, ctaButtons, backgroundImage |
| Feature Card (7:29) | `<FeatureCard>` | title, value, description |

## Next Steps

1. Set up Tailwind config with extracted color tokens
2. Create typography utilities matching Mulish font system
3. Build Button component with both variants
4. Build Navbar component
5. Build Hero section component
6. Build Feature card component
7. Build About section layout
8. Integrate with Lumiere Design System repository

## Prompts to Use

For generating these components, use:
- `typescript-strict` - Type-safe props
- `tailwind-utility-first` - Use Tailwind classes
- `design-tokens` - Match extracted tokens
- `responsive-mobile-first` - Make responsive
- `component-variants` - Support button variants
- `aria-compliant` - Accessibility
- `functional-hooks` - Modern React patterns
