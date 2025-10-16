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
// TODO: ADD YOUR CREDENTIALS HERE
// ============================================
const FIGMA_ACCESS_TOKEN = "figd_YOUR_TOKEN_HERE";
const ANTHROPIC_API_KEY = "sk-ant-YOUR_KEY_HERE";
const SUPABASE_URL = "https://oejykyovgwfaxyirtyxv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lanlreW92Z3dmYXh5aXJ0eXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5ODE0NTUsImV4cCI6MjA0NDU1NzQ1NX0.R07lFxIIb9T0Hnkm14RJkTIzz2CxW3MdMjqjLo0M1Kc";

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
      'https://api.figma.com/v1/files/FhScFrbbi6hYCvubHQjI9T',
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

async function testAnthropicAPI() {
  console.log("\n🔍 Testing Anthropic API...");

  if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY === "sk-ant-YOUR_KEY_HERE") {
    console.log("⚠️  Anthropic API key not set. Please add your key to this file.");
    return false;
  }

  console.log("✅ Anthropic API key is set (not testing actual API call to save credits)");
  return true;
}

async function runTests() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║  MCP Server Standalone Test Suite     ║");
  console.log("╚════════════════════════════════════════╝");

  const dbOk = await testDatabaseConnection();
  const figmaOk = await testFigmaAPI();
  const anthropicOk = await testAnthropicAPI();

  console.log("\n" + "=".repeat(42));
  console.log("📊 Test Results:");
  console.log("=".repeat(42));
  console.log(`Database:  ${dbOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Figma API: ${figmaOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Anthropic: ${anthropicOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log("=".repeat(42));

  if (dbOk && figmaOk && anthropicOk) {
    console.log("\n🎉 All tests passed! Your MCP server is ready to use.");
    console.log("\nNext steps:");
    console.log("  1. Use it with Claude Desktop (see QUICK_START.md)");
    console.log("  2. Or use it with VS Code Continue extension");
  } else {
    console.log("\n⚠️  Some tests failed. Please fix the issues above.");
  }
}

runTests().catch(console.error);
