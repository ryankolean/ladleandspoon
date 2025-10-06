import { supabase } from '@/lib/supabase';

export const User = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async signUp(email, password, options = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data;
  },

  async updateMyUserData(updates) {
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
    return supabase.auth.onAuthStateChange(callback);
  }
};
