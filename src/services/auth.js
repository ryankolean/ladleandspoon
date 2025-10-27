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

  async checkAccountLockout(email) {
    checkSupabase();
    try {
      const { data, error } = await supabase.rpc('check_account_lockout', {
        p_email: email
      });

      if (error) {
        console.error('Error checking lockout:', error);
        return { isLocked: false, lockedUntil: null, failedAttempts: 0 };
      }

      if (data && data.length > 0) {
        const lockoutInfo = data[0];
        return {
          isLocked: lockoutInfo.is_locked,
          lockedUntil: lockoutInfo.locked_until,
          failedAttempts: lockoutInfo.failed_attempts,
          reason: lockoutInfo.reason
        };
      }

      return { isLocked: false, lockedUntil: null, failedAttempts: 0 };
    } catch (err) {
      console.error('Exception checking lockout:', err);
      return { isLocked: false, lockedUntil: null, failedAttempts: 0 };
    }
  },

  async recordLoginAttempt(email, success, errorMessage = null) {
    checkSupabase();
    try {
      await supabase.rpc('record_login_attempt', {
        p_email: email,
        p_success: success,
        p_ip_address: null,
        p_user_agent: navigator?.userAgent || null,
        p_error_message: errorMessage
      });
    } catch (err) {
      console.error('Error recording login attempt:', err);
    }
  },

  async signIn(email, password) {
    checkSupabase();

    const lockoutStatus = await this.checkAccountLockout(email);

    if (lockoutStatus.isLocked) {
      const lockedUntil = new Date(lockoutStatus.lockedUntil);
      const minutesRemaining = Math.ceil((lockedUntil - new Date()) / 60000);
      const error = new Error(
        `Account temporarily locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
      );
      error.code = 'ACCOUNT_LOCKED';
      error.lockedUntil = lockoutStatus.lockedUntil;
      throw error;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      await this.recordLoginAttempt(email, false, error.message);
      throw error;
    }

    await this.recordLoginAttempt(email, true);
    return data;
  },

  async resetPasswordForEmail(email) {
    checkSupabase();
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword) {
    checkSupabase();
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
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

    const profileFields = [
      'first_name',
      'last_name',
      'full_name',
      'phone',
      'role',
      'date_of_birth',
      'preferences',
      'sms_consent',
      'sms_consent_date',
      'sms_consent_method',
      'sms_consent_ip'
    ];
    profileFields.forEach(field => {
      if (updates[field] !== undefined) {
        profileUpdates[field] = updates[field];
      }
    });

    // Auto-generate full_name if first_name or last_name provided
    if (updates.first_name !== undefined || updates.last_name !== undefined) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .maybeSingle();

        const firstName = updates.first_name !== undefined ? updates.first_name : (currentProfile?.first_name || '');
        const lastName = updates.last_name !== undefined ? updates.last_name : (currentProfile?.last_name || '');
        profileUpdates.full_name = `${firstName} ${lastName}`.trim();
      }
    }

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

  async signInWithOAuth(provider, options = {}) {
    checkSupabase();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options
    });
    if (error) throw error;
    return data;
  },

  login() {
    console.log('Please implement authentication login');
  },

  loginWithRedirect(redirectUrl) {
    window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  },

  onAuthStateChange(callback) {
    checkSupabase();
    return supabase.auth.onAuthStateChange(callback);
  },

  async isAdmin() {
    checkSupabase();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_user_admin', {
        user_uuid: user.id
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('Exception checking admin status:', err);
      return false;
    }
  },

  async listUsersWithRoles() {
    checkSupabase();
    const { data, error } = await supabase.rpc('list_users_with_roles');
    if (error) throw error;
    return data;
  },

  async grantAdminRole(userId) {
    checkSupabase();
    const { data, error } = await supabase.rpc('grant_admin_role', {
      target_user_id: userId
    });
    if (error) throw error;
    return data;
  },

  async revokeAdminRole(userId) {
    checkSupabase();
    const { data, error } = await supabase.rpc('revoke_admin_role', {
      target_user_id: userId
    });
    if (error) throw error;
    return data;
  }
};
