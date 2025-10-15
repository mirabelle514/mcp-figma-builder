import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface LumiereComponent {
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

export class DatabaseService {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async storeLumiereComponent(component: LumiereComponent): Promise<void> {
    const { error } = await this.client
      .from('lumiere_components')
      .upsert(component, { onConflict: 'component_name' });

    if (error) {
      throw new Error(`Failed to store component: ${error.message}`);
    }
  }

  async storeLumiereComponents(components: LumiereComponent[]): Promise<void> {
    const { error } = await this.client
      .from('lumiere_components')
      .upsert(components, { onConflict: 'component_name' });

    if (error) {
      throw new Error(`Failed to store components: ${error.message}`);
    }
  }

  async getLumiereComponents(): Promise<LumiereComponent[]> {
    const { data, error } = await this.client
      .from('lumiere_components')
      .select('*')
      .order('component_name');

    if (error) {
      throw new Error(`Failed to fetch components: ${error.message}`);
    }

    return data || [];
  }

  async getLumiereComponent(componentName: string): Promise<LumiereComponent | null> {
    const { data, error } = await this.client
      .from('lumiere_components')
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
      .from('lumiere_components')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to count components: ${error.message}`);
    }

    return count || 0;
  }
}
