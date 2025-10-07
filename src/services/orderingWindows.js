import { supabase } from '@/lib/supabase';
import { checkSupabase } from '@/lib/supabaseCheck';

export const OrderingWindow = {
  async list(orderBy = 'day_of_week') {
    const [field, direction] = orderBy.startsWith('-')
      ? [orderBy.slice(1), false]
      : [orderBy, true];

    const { data, error } = await supabase
      .from('ordering_windows')
      .select('*')
      .order(field, { ascending: direction });

    if (error) throw error;
    return data;
  },

  async filter(filters) {
    let query = supabase.from('ordering_windows').select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('ordering_windows')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(windowData) {
    const { data, error } = await supabase
      .from('ordering_windows')
      .insert({
        ...windowData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('ordering_windows')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('ordering_windows')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
