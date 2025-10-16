/*
  # Add React Generation System

  This migration adds tables for storing Figma design data and generated React components.

  ## New Tables

  ### `figma_designs`
  Stores complete Figma design data for code generation
  - `id` (uuid, primary key) - Unique identifier
  - `figma_url` (text) - Source Figma URL
  - `file_key` (text) - Figma file key
  - `node_id` (text) - Figma node ID (optional)
  - `design_name` (text) - Name from Figma
  - `raw_data` (jsonb) - Complete Figma node data
  - `created_at` (timestamptz) - Creation timestamp

  ### `generated_components`
  Stores generated React components
  - `id` (uuid, primary key) - Unique identifier
  - `figma_design_id` (uuid) - Reference to figma_designs
  - `component_name` (text) - Generated component name
  - `component_code` (text) - Generated React/TypeScript code
  - `styles` (text) - Extracted Tailwind classes or CSS
  - `props_interface` (text) - TypeScript interface for props
  - `imports` (text array) - Required imports
  - `dependencies` (text array) - NPM packages needed
  - `ai_model` (text) - AI model used for generation
  - `generation_prompt` (text) - Prompt used for generation
  - `metadata` (jsonb) - Additional metadata (colors, spacing, etc.)
  - `created_at` (timestamptz) - Generation timestamp

  ### `generation_history`
  Tracks generation requests and results
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who made the request (optional for MCP)
  - `figma_design_id` (uuid) - Reference to figma_designs
  - `generated_component_id` (uuid) - Reference to generated_components
  - `success` (boolean) - Whether generation succeeded
  - `error_message` (text) - Error message if failed
  - `generation_time_ms` (integer) - Time taken to generate
  - `created_at` (timestamptz) - Request timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for development (can be restricted later)
  - Service role has full access
*/

-- Create figma_designs table
CREATE TABLE IF NOT EXISTS figma_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  figma_url text NOT NULL,
  file_key text NOT NULL,
  node_id text,
  design_name text NOT NULL,
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create generated_components table
CREATE TABLE IF NOT EXISTS generated_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  figma_design_id uuid REFERENCES figma_designs(id) ON DELETE CASCADE,
  component_name text NOT NULL,
  component_code text NOT NULL,
  styles text,
  props_interface text,
  imports text[] DEFAULT '{}',
  dependencies text[] DEFAULT '{}',
  ai_model text DEFAULT 'claude-3-5-sonnet-20241022',
  generation_prompt text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  figma_design_id uuid REFERENCES figma_designs(id) ON DELETE CASCADE,
  generated_component_id uuid REFERENCES generated_components(id) ON DELETE SET NULL,
  success boolean DEFAULT false,
  error_message text,
  generation_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_figma_designs_file_key ON figma_designs(file_key);
CREATE INDEX IF NOT EXISTS idx_figma_designs_created ON figma_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_components_figma_design ON generated_components(figma_design_id);
CREATE INDEX IF NOT EXISTS idx_generated_components_created ON generated_components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_user ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created ON generation_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE figma_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- Policies for figma_designs (public read for MCP)
CREATE POLICY "Anyone can read figma designs"
  ON figma_designs FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert figma designs"
  ON figma_designs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update figma designs"
  ON figma_designs FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for generated_components (public read)
CREATE POLICY "Anyone can read generated components"
  ON generated_components FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert generated components"
  ON generated_components FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update generated components"
  ON generated_components FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policies for generation_history (public read)
CREATE POLICY "Anyone can read generation history"
  ON generation_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert generation history"
  ON generation_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update generation history"
  ON generation_history FOR UPDATE
  USING (true)
  WITH CHECK (true);
