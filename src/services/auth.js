import { supabase } from '@/lib/supabase';
import { checkSupabase } from '@/lib/supabaseCheck';

export const User = {
  async me() {
    checkSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    return {
      ...user,
      ...profile,
      email: user.email,
      id: user.id
    };
  },

  async getCurrentUser() {
    checkSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    return {
      ...user,
      ...profile,
      email: user.email,
      id: user.id
    };
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

    const authUpdates = {};
    const profileUpdates = {};

    if (updates.email) authUpdates.email = updates.email;
    if (updates.password) authUpdates.password = updates.password;

    const profileFields = ['full_name', 'phone', 'role', 'date_of_birth', 'preferences'];
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabase.auth.updateUser(authUpdates);
      if (authError) throw authError;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        profileUpdates.updated_at = new Date().toISOString();
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) throw profileError;
      }
    }

    return await this.me();
  },

  async updateMyUserData(updates) {
    return await this.updateUser(updates);
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
