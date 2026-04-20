import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface Component {
  id?: string;
  component_name: string;
  component_path: string;
  description?: string;
  category: string;
  props: Record<string, any>;
  variants: Record<string, string[]>;
  visual_patterns: string[];
  figma_keywords: string[];
  usage_example?: string;
  repo_url?: string;
}

interface ImplementationGuide {
  id?: string;
  user_id?: string;
  figma_url: string;
  figma_node_id?: string;
  detected_components: any[];
  implementation_code: string;
  customization_notes?: string;
  metadata?: Record<string, any>;
}

interface FigmaDesign {
  id?: string;
  figma_url: string;
  file_key: string;
  node_id?: string;
  design_name: string;
  raw_data: Record<string, any>;
}

interface GeneratedComponent {
  id?: string;
  figma_design_id: string;
  component_name: string;
  component_code: string;
  styles?: string;
  props_interface?: string;
  imports: string[];
  dependencies: string[];
  ai_model: string;
  generation_prompt?: string;
  metadata?: Record<string, any>;
}

interface GenerationHistory {
  id?: string;
  user_id?: string;
  figma_design_id: string;
  generated_component_id?: string;
  success: boolean;
  error_message?: string;
  generation_time_ms?: number;
}

export class DatabaseService {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async storeComponent(component: Component): Promise<void> {
    const { error } = await this.client
      .from('components')
      .upsert(component, { onConflict: 'component_name' });

    if (error) {
      throw new Error(`Failed to store component: ${error.message}`);
    }
  }

  async storeComponents(components: Component[]): Promise<void> {
    const { error } = await this.client
      .from('components')
      .upsert(components, { onConflict: 'component_name' });

    if (error) {
      throw new Error(`Failed to store components: ${error.message}`);
    }
  }

  async getComponents(): Promise<Component[]> {
    const { data, error } = await this.client
      .from('components')
      .select('*')
      .order('component_name');

    if (error) {
      throw new Error(`Failed to fetch components: ${error.message}`);
    }

    return data || [];
  }

  async getComponent(componentName: string): Promise<Component | null> {
    const { data, error } = await this.client
      .from('components')
      .select('*')
      .eq('component_name', componentName)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch component: ${error.message}`);
    }

    return data;
  }

  async storeImplementationGuide(guide: ImplementationGuide): Promise<string> {
    const { data, error } = await this.client
      .from('implementation_guides')
      .insert(guide)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to store implementation guide: ${error.message}`);
    }

    return data.id;
  }

  async getImplementationGuides(userId?: string): Promise<ImplementationGuide[]> {
    let query = this.client
      .from('implementation_guides')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch implementation guides: ${error.message}`);
    }

    return data || [];
  }

  async getComponentCount(): Promise<number> {
    const { count, error } = await this.client
      .from('components')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count components: ${error.message}`);
    }

    return count || 0;
  }

  async storeFigmaDesign(design: FigmaDesign): Promise<string> {
    const { data, error } = await this.client
      .from('figma_designs')
      .insert(design)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to store figma design: ${error.message}`);
    }

    return data.id;
  }

  async getFigmaDesign(id: string): Promise<FigmaDesign | null> {
    const { data, error } = await this.client
      .from('figma_designs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch figma design: ${error.message}`);
    }

    return data;
  }

  async storeGeneratedComponent(component: GeneratedComponent): Promise<string> {
    const { data, error } = await this.client
      .from('generated_components')
      .insert(component)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to store generated component: ${error.message}`);
    }

    return data.id;
  }

  async getGeneratedComponent(id: string): Promise<GeneratedComponent | null> {
    const { data, error } = await this.client
      .from('generated_components')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch generated component: ${error.message}`);
    }

    return data;
  }

  async getGeneratedComponentsByDesign(figmaDesignId: string): Promise<GeneratedComponent[]> {
    const { data, error } = await this.client
      .from('generated_components')
      .select('*')
      .eq('figma_design_id', figmaDesignId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch generated components: ${error.message}`);
    }

    return data || [];
  }

  async storeGenerationHistory(history: GenerationHistory): Promise<string> {
    const { data, error } = await this.client
      .from('generation_history')
      .insert(history)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to store generation history: ${error.message}`);
    }

    return data.id;
  }

  async getGenerationHistory(userId?: string): Promise<GenerationHistory[]> {
    let query = this.client
      .from('generation_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch generation history: ${error.message}`);
    }

    return data || [];
  }
}
