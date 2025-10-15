/*
  # Redesign: Lumiere Component Mapping System

  This migration redesigns the system to map Figma designs to existing Lumiere Design System components.

  ## New Tables

  ### `lumiere_components`
  Stores metadata about available components in the Lumiere Design System
  - `id` (uuid, primary key) - Unique identifier
  - `component_name` (text, unique) - Component name (e.g., 'Button', 'Hero', 'Navbar')
  - `component_path` (text) - Import path in the repo
  - `description` (text) - What this component does
  - `category` (text) - Component category (navigation, layout, forms, etc.)
  - `props` (jsonb) - Component props schema
  - `variants` (jsonb) - Available variants (primary, secondary, etc.)
  - `visual_patterns` (text array) - Visual patterns this component matches
  - `figma_keywords` (text array) - Keywords to match from Figma
  - `usage_example` (text) - Code example
  - `repo_url` (text) - Link to component in GitHub
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `figma_component_mappings`
  Maps Figma design patterns to Lumiere components
  - `id` (uuid, primary key) - Unique identifier
  - `figma_pattern` (text) - Pattern detected in Figma (e.g., 'button', 'hero-section')
  - `lumiere_component_id` (uuid) - Reference to lumiere_components
  - `confidence_score` (numeric) - How confident the match is (0-1)
  - `matching_rules` (jsonb) - Rules used to match this pattern
  - `created_at` (timestamptz) - Creation timestamp

  ### `implementation_guides`
  Stores generated implementation guides
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid) - User who generated this
  - `figma_url` (text) - Source Figma URL
  - `figma_node_id` (text) - Specific node ID
  - `detected_components` (jsonb) - Array of detected components with props
  - `implementation_code` (text) - Generated implementation code
  - `customization_notes` (text) - Notes on customizing the implementation
  - `metadata` (jsonb) - Additional metadata (colors, spacing, etc.)
  - `created_at` (timestamptz) - Generation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `implementation_prompts`
  Fast prompts for customizing implementations
  - `id` (uuid, primary key) - Unique identifier
  - `prompt_id` (text, unique) - Prompt identifier
  - `name` (text) - Display name
  - `category` (text) - Category (styling, behavior, accessibility)
  - `question` (text) - Question to ask developer
  - `applies_to` (text array) - Component types this applies to
  - `code_template` (text) - Code snippet template
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Allow authenticated users to read all components and mappings
  - Users can create and manage their own implementation guides
*/

-- Create lumiere_components table
CREATE TABLE IF NOT EXISTS lumiere_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name text UNIQUE NOT NULL,
  component_path text NOT NULL,
  description text,
  category text NOT NULL,
  props jsonb DEFAULT '{}',
  variants jsonb DEFAULT '{}',
  visual_patterns text[] DEFAULT '{}',
  figma_keywords text[] DEFAULT '{}',
  usage_example text,
  repo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create figma_component_mappings table
CREATE TABLE IF NOT EXISTS figma_component_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  figma_pattern text NOT NULL,
  lumiere_component_id uuid REFERENCES lumiere_components(id) ON DELETE CASCADE,
  confidence_score numeric DEFAULT 1.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  matching_rules jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create implementation_guides table
CREATE TABLE IF NOT EXISTS implementation_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  figma_url text NOT NULL,
  figma_node_id text,
  detected_components jsonb DEFAULT '[]',
  implementation_code text NOT NULL,
  customization_notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create implementation_prompts table
CREATE TABLE IF NOT EXISTS implementation_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  question text NOT NULL,
  applies_to text[] DEFAULT '{}',
  code_template text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lumiere_components_category ON lumiere_components(category);
CREATE INDEX IF NOT EXISTS idx_lumiere_components_keywords ON lumiere_components USING gin(figma_keywords);
CREATE INDEX IF NOT EXISTS idx_lumiere_components_patterns ON lumiere_components USING gin(visual_patterns);
CREATE INDEX IF NOT EXISTS idx_figma_mappings_component ON figma_component_mappings(lumiere_component_id);
CREATE INDEX IF NOT EXISTS idx_implementation_guides_user ON implementation_guides(user_id);
CREATE INDEX IF NOT EXISTS idx_implementation_guides_created ON implementation_guides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_implementation_prompts_category ON implementation_prompts(category);

-- Enable Row Level Security
ALTER TABLE lumiere_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE figma_component_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_prompts ENABLE ROW LEVEL SECURITY;

-- Policies for lumiere_components (public read)
CREATE POLICY "Anyone can read lumiere components"
  ON lumiere_components FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify lumiere components"
  ON lumiere_components FOR ALL
  USING (false)
  WITH CHECK (false);

-- Policies for figma_component_mappings (public read)
CREATE POLICY "Anyone can read figma mappings"
  ON figma_component_mappings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify figma mappings"
  ON figma_component_mappings FOR ALL
  USING (false)
  WITH CHECK (false);

-- Policies for implementation_guides (user-specific)
CREATE POLICY "Users can read own implementation guides"
  ON implementation_guides FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own implementation guides"
  ON implementation_guides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own implementation guides"
  ON implementation_guides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own implementation guides"
  ON implementation_guides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for implementation_prompts (public read)
CREATE POLICY "Anyone can read implementation prompts"
  ON implementation_prompts FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify implementation prompts"
  ON implementation_prompts FOR ALL
  USING (false)
  WITH CHECK (false);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_lumiere_components_updated_at
  BEFORE UPDATE ON lumiere_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_implementation_guides_updated_at
  BEFORE UPDATE ON implementation_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
