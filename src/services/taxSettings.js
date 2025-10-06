import { supabase } from '@/lib/supabase';

export const TaxSettings = {
  async list() {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCurrent() {
    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(settingsData) {
    const { data, error } = await supabase
      .from('tax_settings')
      .insert({
        ...settingsData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('tax_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
