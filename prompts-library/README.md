# Prompts Library

A curated collection of prompt templates for Design-to-React component generation, optimized for engineering workflows.

## Overview

This library contains reusable prompt templates that guide AI-assisted component generation from Figma designs. Each prompt focuses on specific aspects of React development, ensuring generated code follows best practices and maintains consistency with your design system.

## Categories

### 1. Component Structure
Prompts for component architecture and organization

### 2. Styling & Design
Prompts for visual implementation and styling approaches

### 3. Behavior & Interaction
Prompts for component functionality and user interactions

### 4. Accessibility
Prompts for WCAG compliance and inclusive design

### 5. Performance
Prompts for optimization and efficient rendering

### 6. Testing
Prompts for test coverage and quality assurance

## Usage

### In MCP Server Context

```typescript
"Generate a React component from Figma design:
https://www.figma.com/file/...

Use prompts: 'typescript-strict', 'tailwind-styling', 'accessible-forms'"
```

### Combining Prompts

Prompts can be layered for comprehensive generation:

```typescript
"Generate with prompts:
- 'component-structure-hooks'
- 'responsive-mobile-first'
- 'aria-compliant'
- 'performance-memoized'"
```

## Prompt Files

Each category has its own JSON file containing prompt templates.

## Contributing

When adding new prompts:
1. Choose the appropriate category
2. Use clear, actionable language
3. Include specific technical requirements
4. Test with various Figma designs
5. Document expected outcomes
