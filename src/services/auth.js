import { supabase } from '@/lib/supabase';
import { checkSupabase } from '@/lib/supabaseCheck';

export const User = {
  async me() {
    checkSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentUser() {
    checkSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async signUp(email, password, options = {}) {
    checkSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    checkSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    checkSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async logout() {
    checkSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    checkSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async updateUser(updates) {
    checkSupabase();
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },

  async updateMyUserData(updates) {
    checkSupabase();
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    return data;
  },

  login() {
    console.log('Please implement authentication login');
  },

  loginWithRedirect(redirectUrl) {
    console.log('Please implement authentication with redirect:', redirectUrl);
  },

  onAuthStateChange(callback) {
    checkSupabase();
    return supabase.auth.onAuthStateChange(callback);
  }
};
