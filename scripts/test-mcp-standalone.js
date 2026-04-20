#!/usr/bin/env node

/**
 * Standalone test for the MCP server
 * Run this without Claude Desktop to test the core functionality
 *
 * Usage:
 * 1. Set your environment variables below
 * 2. Run: node test-mcp-standalone.js
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// TODO: ADD YOUR FIGMA TOKEN HERE (Required)
// ============================================
const FIGMA_ACCESS_TOKEN = "YOUR_FIGMA_TOKEN_HERE";

// These need to be configured with your actual values
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

// NOTE: Anthropic API key is OPTIONAL - only needed for React generation
// You can test everything else without it!

async function testDatabaseConnection() {
  console.log("\n🔍 Testing database connection...");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data, error } = await supabase
    .from('figma_designs')
    .select('count')
    .limit(1);

  if (error) {
    console.log("❌ Database connection failed:", error.message);
    return false;
  }

  console.log("✅ Database connection successful!");
  return true;
}

async function testFigmaAPI() {
  console.log("\n🔍 Testing Figma API...");

  if (!FIGMA_ACCESS_TOKEN || FIGMA_ACCESS_TOKEN === "figd_YOUR_TOKEN_HERE") {
    console.log("⚠️  Figma token not set. Please add your token to this file.");
    return false;
  }

  try {
    // Test with a public Figma file
    const response = await fetch(
      'https://api.figma.com/v1/files/YOUR_FIGMA_FILE_KEY',
      {
        headers: {
          'X-Figma-Token': FIGMA_ACCESS_TOKEN
        }
      }
    );

    if (!response.ok) {
      console.log("❌ Figma API failed:", response.status, response.statusText);
      return false;
    }

    console.log("✅ Figma API connection successful!");
    return true;
  } catch (err) {
    console.log("❌ Figma API error:", err.message);
    return false;
  }
}

async function testMCPServerEnvironment() {
  console.log("\n🔍 Testing MCP Server environment...");

  const env = {
    FIGMA_ACCESS_TOKEN,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    REPO_OWNER: "your-github-username",
    REPO_NAME: "your-design-system"
  };

  const missing = [];
  if (!env.FIGMA_ACCESS_TOKEN || env.FIGMA_ACCESS_TOKEN === "figd_YOUR_TOKEN_HERE") {
    missing.push("FIGMA_ACCESS_TOKEN");
  }
  if (!env.SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!env.SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    console.log(`❌ Missing required environment: ${missing.join(", ")}`);
    return false;
  }

  console.log("✅ MCP Server environment configured!");
  console.log("   ℹ️  Note: Anthropic API key is optional (only for React generation)");
  return true;
}

async function runTests() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  MCP Server Standalone Test Suite     ║");
  console.log("╚════════════════════════════════════════╝");

  const dbOk = await testDatabaseConnection();
  const figmaOk = await testFigmaAPI();
  const envOk = await testMCPServerEnvironment();

  console.log("\n" + "=".repeat(42));
  console.log("📊 Test Results:");
  console.log("=".repeat(42));
  console.log(`Database:     ${dbOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Figma API:    ${figmaOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`MCP Server:   ${envOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log("=".repeat(42));

  if (dbOk && figmaOk && envOk) {
    console.log("\n🎉 Core functionality ready! You can now:");
    console.log("\n  1. Scan the design system repository");
    console.log("  2. Analyze Figma designs");
    console.log("  3. Match components");
    console.log("  4. Generate implementation guides");
    console.log("\n  ℹ️  For React generation, add ANTHROPIC_API_KEY to Claude Desktop config");
    console.log("\nNext steps:");
    console.log("  • Use with Claude Desktop (see QUICK_START.md)");
    console.log("  • Or use with VS Code Continue extension");
  } else {
    console.log("\n⚠️  Some tests failed. Please fix the issues above.");
  }
}

runTests().catch(console.error);
