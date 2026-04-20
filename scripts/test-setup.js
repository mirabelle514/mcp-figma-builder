#!/usr/bin/env node

/**
 * Test Setup Script
 * Verifies your MCP server configuration before testing
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Component-Figma MCP Server Setup Checker\n');

// Check 1: Build output exists
console.log('1️⃣  Checking build output...');
const distPath = resolve(__dirname, '../mcp-server/dist/index.js');
if (existsSync(distPath)) {
  console.log('   ✅ Build output exists at:', distPath);
} else {
  console.log('   ❌ Build output not found!');
  console.log('   → Run: cd mcp-server && npm run build');
  process.exit(1);
}

// Check 2: Package dependencies
console.log('\n2️⃣  Checking dependencies...');
const packagePath = resolve(__dirname, '../mcp-server/package.json');
try {
  const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  const required = [
    '@anthropic-ai/sdk',
    'openai',
    '@modelcontextprotocol/sdk',
    '@supabase/supabase-js',
    'zod'
  ];

  required.forEach(dep => {
    if (deps[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ❌ Missing: ${dep}`);
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
}

// Check 3: Environment template
console.log('\n3️⃣  Checking environment configuration...');
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  const env = readFileSync(envPath, 'utf-8');
  const hasSupabaseUrl = env.includes('SUPABASE_URL');
  const hasSupabaseKey = env.includes('SUPABASE_ANON_KEY');

  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('   ✅ Supabase configuration found');
  } else {
    console.log('   ⚠️  Incomplete Supabase configuration');
  }
} else {
  console.log('   ⚠️  No .env file found (this is OK if using Claude config)');
}

// Check 4: AI Provider implementation
console.log('\n4️⃣  Checking AI provider implementation...');
const aiProviderPath = resolve(__dirname, '../mcp-server/src/services/ai-provider.ts');
if (existsSync(aiProviderPath)) {
  const content = readFileSync(aiProviderPath, 'utf-8');

  const hasAnthropic = content.includes('class AnthropicProvider');
  const hasOpenAI = content.includes('class OpenAIProvider');
  const hasNoAI = content.includes('class NoAIProvider');

  if (hasAnthropic) console.log('   ✅ Anthropic provider implemented');
  if (hasOpenAI) console.log('   ✅ OpenAI provider implemented');
  if (hasNoAI) console.log('   ✅ No-AI mode implemented');

  if (hasAnthropic && hasOpenAI && hasNoAI) {
    console.log('   ✅ All three modes available!');
  }
} else {
  console.log('   ❌ AI provider file not found');
}

// Check 5: Documentation
console.log('\n5️⃣  Checking documentation...');
const docs = [
  'mcp-server/README.md',
  'docs/QUICK_START.md',
  'docs/SETUP_MODES.md',
  'docs/TESTING_GUIDE.md',
  'docs/TEAM_SETUP_GUIDE.md'
];

docs.forEach(doc => {
  const docPath = resolve(__dirname, '..', doc);
  if (existsSync(docPath)) {
    console.log(`   ✅ ${doc}`);
  } else {
    console.log(`   ❌ Missing: ${doc}`);
  }
});

// Summary
console.log('\n📋 Configuration Modes Available:\n');
console.log('   1️⃣  Component Mapping Only (No AI)');
console.log('      → No API keys needed');
console.log('      → Free, instant results');
console.log('      → Matches Figma to components\n');

console.log('   2️⃣  Component Mapping + Anthropic');
console.log('      → Requires: ANTHROPIC_API_KEY');
console.log('      → AI code generation with Claude');
console.log('      → ~$5-20 per project\n');

console.log('   3️⃣  Component Mapping + OpenAI');
console.log('      → Requires: OPENAI_API_KEY');
console.log('      → AI code generation with GPT-4');
console.log('      → ~$10-30 per project\n');

console.log('🎯 Next Steps:\n');
console.log('   1. Choose your mode from above');
console.log('   2. Get required API keys (see docs/TESTING_GUIDE.md)');
console.log('   3. Configure Claude Desktop (see mcp-server/README.md)');
console.log('   4. Restart Claude Desktop completely');
console.log('   5. Test with a simple Figma design\n');

console.log('📚 Documentation:');
console.log('   • Full guide: mcp-server/README.md');
console.log('   • Testing: docs/TESTING_GUIDE.md');
console.log('   • Team guide: docs/TEAM_SETUP_GUIDE.md');
console.log('   • Mode comparison: docs/SETUP_MODES.md\n');

console.log('✅ Setup check complete!\n');
