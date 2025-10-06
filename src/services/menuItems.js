import { supabase } from '@/lib/supabase';

export const MenuItem = {
  async list(orderBy = '-created_at') {
    const [field, direction] = orderBy.startsWith('-')
      ? [orderBy.slice(1), false]
      : [orderBy, true];

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order(field, { ascending: direction });

    if (error) throw error;
    return data;
  },

  async filter(filters) {
    let query = supabase.from('menu_items').select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(itemData) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        ...itemData,
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
      .from('menu_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
