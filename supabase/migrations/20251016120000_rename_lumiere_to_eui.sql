/*
  # Rename Lumiere to EUI

  This migration renames all Lumiere references to EUI to reflect the new naming convention.

  1. Changes
    - Rename `lumiere_components` table to `eui_components`
    - Update all indexes
    - Update all RLS policies
    - Update foreign key references in `figma_component_mappings`
    - Update triggers

  2. Security
    - All existing RLS policies are preserved with new names
    - No changes to security model
*/

-- Rename the table
ALTER TABLE IF EXISTS lumiere_components RENAME TO eui_components;

-- Rename the indexes
ALTER INDEX IF EXISTS idx_lumiere_components_category RENAME TO idx_eui_components_category;
ALTER INDEX IF EXISTS idx_lumiere_components_keywords RENAME TO idx_eui_components_keywords;
ALTER INDEX IF EXISTS idx_lumiere_components_patterns RENAME TO idx_eui_components_patterns;

-- Rename the column in figma_component_mappings (if it needs to match naming convention)
-- The foreign key constraint will automatically follow the table rename

-- Rename RLS policies
DROP POLICY IF EXISTS "Anyone can read lumiere components" ON eui_components;
DROP POLICY IF EXISTS "Only admins can modify lumiere components" ON eui_components;

CREATE POLICY "Anyone can read EUI components"
  ON eui_components FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify EUI components"
  ON eui_components FOR ALL
  USING (false);

-- Rename the trigger
DROP TRIGGER IF EXISTS update_lumiere_components_updated_at ON eui_components;

CREATE TRIGGER update_eui_components_updated_at
  BEFORE UPDATE ON eui_components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update the index name reference in figma_component_mappings
-- (The foreign key reference lumiere_component_id is fine as a column name,
-- but let's rename it for consistency)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'figma_component_mappings'
    AND column_name = 'lumiere_component_id'
  ) THEN
    ALTER TABLE figma_component_mappings
    RENAME COLUMN lumiere_component_id TO eui_component_id;
  END IF;
END $$;

-- Update the index name for the foreign key
ALTER INDEX IF EXISTS idx_figma_mappings_component RENAME TO idx_figma_mappings_eui_component;
