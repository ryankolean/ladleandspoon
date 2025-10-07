import { supabase } from '@/lib/supabase';
import { checkSupabase } from '@/lib/supabaseCheck';

export const Order = {
  async list(orderBy = '-created_at') {
    const [field, direction] = orderBy.startsWith('-')
      ? [orderBy.slice(1), false]
      : [orderBy, true];

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order(field, { ascending: direction });

    if (error) throw error;
    return data;
  },

  async filter(filters) {
    let query = supabase.from('orders').select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async get(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
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
      .from('orders')
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
    const { error} = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
