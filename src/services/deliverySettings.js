import { supabase } from '@/lib/supabase';

const checkSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
};

export const DeliverySettings = {
  async getSettings() {
    checkSupabase();
    const { data, error } = await supabase.rpc('get_delivery_settings');
    if (error) throw error;
    return data?.[0] || { base_delivery_fee: 5.00, is_active: true };
  },

  async updateSettings(baseFee, isActive = true, reason = null) {
    checkSupabase();
    const { data, error } = await supabase.rpc('update_delivery_settings', {
      new_base_fee: baseFee,
      new_is_active: isActive,
      reason: reason
    });
    if (error) throw error;
    return data;
  },

  async getAuditHistory() {
    checkSupabase();
    const { data, error } = await supabase.rpc('get_delivery_settings_audit');
    if (error) throw error;
    return data || [];
  },

  calculateDeliveryFee(settings) {
    if (!settings || !settings.is_active) {
      return 0;
    }
    return parseFloat(settings.base_delivery_fee) || 0;
  },

  formatFee(fee) {
    return `$${parseFloat(fee).toFixed(2)}`;
  }
};
