/*
  # Prompts Library Schema

  This migration creates the database structure for storing and managing design-to-react prompt templates.

  ## New Tables

  ### `prompt_templates`
  Stores reusable prompt templates for component generation
  - `id` (uuid, primary key) - Unique identifier
  - `prompt_id` (text, unique) - Human-readable ID (e.g., 'typescript-strict')
  - `name` (text) - Display name
  - `category` (text) - Category (component-structure, styling-design, etc.)
  - `content` (text) - The actual prompt content
  - `tags` (text array) - Searchable tags
  - `recommended_for` (text array) - Component types this prompt is recommended for
  - `metadata` (jsonb) - Additional metadata
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `prompt_categories`
  Stores prompt category information
  - `id` (uuid, primary key) - Unique identifier
  - `category_id` (text, unique) - Category identifier
  - `name` (text) - Display name
  - `description` (text) - Category description
  - `file_name` (text) - Associated JSON file name
  - `prompt_count` (integer) - Number of prompts in category
  - `created_at` (timestamptz) - Creation timestamp

  ### `prompt_combinations`
  Stores common prompt combinations/presets
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Combination name
  - `description` (text) - What this combination is for
  - `prompt_ids` (text array) - Array of prompt_id values
  - `use_case` (text) - When to use this combination
  - `created_at` (timestamptz) - Creation timestamp

  ### `generation_history`
  Tracks component generation history
  - `id` (uuid, primary key) - Unique identifier
  - `figma_url` (text) - Source Figma design URL
  - `component_name` (text) - Generated component name
  - `prompt_ids` (text array) - Prompts used
  - `generated_code` (text) - The generated code
  - `metadata` (jsonb) - Additional generation metadata
  - `created_at` (timestamptz) - Generation timestamp

  ## Security
  - Enable RLS on all tables
  - Allow authenticated users to read all prompts
  - Only specific roles can create/update prompts
  - Generation history is user-specific
*/

-- Create prompt_templates table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  recommended_for text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prompt_categories table
CREATE TABLE IF NOT EXISTS prompt_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  file_name text,
  prompt_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create prompt_combinations table
CREATE TABLE IF NOT EXISTS prompt_combinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  prompt_ids text[] DEFAULT '{}',
  use_case text,
  created_at timestamptz DEFAULT now()
);

-- Create generation_history table
CREATE TABLE IF NOT EXISTS generation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  figma_url text NOT NULL,
  component_name text,
  prompt_ids text[] DEFAULT '{}',
  generated_code text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tags ON prompt_templates USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_generation_history_user ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created ON generation_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

-- Policies for prompt_templates
CREATE POLICY "Anyone can read prompt templates"
  ON prompt_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert prompt templates"
  ON prompt_templates FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update prompt templates"
  ON prompt_templates FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Policies for prompt_categories
CREATE POLICY "Anyone can read prompt categories"
  ON prompt_categories FOR SELECT
  TO authenticated
  USING (true);

-- Policies for prompt_combinations
CREATE POLICY "Anyone can read prompt combinations"
  ON prompt_combinations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert prompt combinations"
  ON prompt_combinations FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Policies for generation_history
CREATE POLICY "Users can read own generation history"
  ON generation_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generation history"
  ON generation_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generation history"
  ON generation_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generation history"
  ON generation_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
