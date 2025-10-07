import { supabase, SESSION_TIMEOUT_MINUTES, REMEMBER_ME_DAYS } from '@/lib/supabase';

const LAST_ACTIVITY_KEY = 'last_activity_time';
const SESSION_EXPIRY_KEY = 'session_expiry_time';
const REMEMBER_ME_KEY = 'remember_me_enabled';
const CSRF_TOKEN_KEY = 'csrf_token';

export class SessionManager {
  constructor() {
    this.activityCheckInterval = null;
    this.warningShown = false;
  }

  generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    return token;
  }

  getCSRFToken() {
    let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!token) {
      token = this.generateCSRFToken();
    }
    return token;
  }

  validateCSRFToken(token) {
    const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    return token === storedToken;
  }

  clearCSRFToken() {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }

  updateLastActivity() {
    const now = Date.now();
    sessionStorage.setItem(LAST_ACTIVITY_KEY, now.toString());

    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    if (rememberMe) {
      const expiryTime = now + (REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    } else {
      const expiryTime = now + (SESSION_TIMEOUT_MINUTES * 60 * 1000);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    }
  }

  isSessionExpired() {
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    const sessionExpiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);

    if (!lastActivity || !sessionExpiry) {
      return false;
    }

    const now = Date.now();
    const expiryTime = parseInt(sessionExpiry);

    return now > expiryTime;
  }

  getTimeUntilExpiry() {
    const sessionExpiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    if (!sessionExpiry) return null;

    const now = Date.now();
    const expiryTime = parseInt(sessionExpiry);
    const timeRemaining = expiryTime - now;

    return timeRemaining > 0 ? timeRemaining : 0;
  }

  async checkSessionValidity() {
    if (this.isSessionExpired()) {
      await this.handleSessionExpiry();
      return false;
    }
    return true;
  }

  async handleSessionExpiry() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }

    this.clearSession();

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        window.location.href = '/login?error=Session expired. Please sign in again.';
      }
    }
  }

  clearSession() {
    sessionStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.removeItem(SESSION_EXPIRY_KEY);
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  }

  setRememberMe(enabled) {
    localStorage.setItem(REMEMBER_ME_KEY, enabled.toString());
    if (enabled) {
      const now = Date.now();
      const expiryTime = now + (REMEMBER_ME_DAYS * 24 * 60 * 60 * 1000);
      sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    } else {
      this.updateLastActivity();
    }
  }

  getRememberMe() {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  startActivityMonitoring() {
    this.updateLastActivity();

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.updateLastActivity(), { passive: true });
    });

    this.activityCheckInterval = setInterval(async () => {
      const timeRemaining = this.getTimeUntilExpiry();

      if (timeRemaining === null) {
        return;
      }

      const fiveMinutes = 5 * 60 * 1000;
      if (timeRemaining <= fiveMinutes && timeRemaining > 0 && !this.warningShown) {
        this.warningShown = true;
        this.showExpiryWarning(Math.ceil(timeRemaining / 60000));
      }

      if (this.isSessionExpired()) {
        await this.handleSessionExpiry();
      }
    }, 30000);
  }

  stopActivityMonitoring() {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  showExpiryWarning(minutesRemaining) {
    if (typeof window !== 'undefined' && window.confirm) {
      const message = `Your session will expire in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}. Click OK to stay signed in.`;
      if (window.confirm(message)) {
        this.updateLastActivity();
        this.warningShown = false;
      }
    }
  }

  async initializeSession(rememberMe = false) {
    this.generateCSRFToken();
    this.setRememberMe(rememberMe);
    this.updateLastActivity();
    this.startActivityMonitoring();

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  async validateSession() {
    const isValid = await this.checkSessionValidity();
    if (!isValid) {
      return null;
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      await this.handleSessionExpiry();
      return null;
    }

    return session;
  }

  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      this.updateLastActivity();
      return data.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      await this.handleSessionExpiry();
      return null;
    }
  }

  getSessionInfo() {
    const lastActivity = sessionStorage.getItem(LAST_ACTIVITY_KEY);
    const sessionExpiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);
    const rememberMe = this.getRememberMe();
    const timeRemaining = this.getTimeUntilExpiry();

    return {
      lastActivity: lastActivity ? new Date(parseInt(lastActivity)) : null,
      sessionExpiry: sessionExpiry ? new Date(parseInt(sessionExpiry)) : null,
      rememberMe,
      timeRemaining,
      isExpired: this.isSessionExpired()
    };
  }
}

export const sessionManager = new SessionManager();

export const withCSRFProtection = (handler) => {
  return async (request) => {
    const token = request.headers?.['X-CSRF-Token'] || request.csrfToken;

    if (!sessionManager.validateCSRFToken(token)) {
      throw new Error('Invalid CSRF token');
    }

    return handler(request);
  };
};

export const getCSRFHeaders = () => {
  return {
    'X-CSRF-Token': sessionManager.getCSRFToken()
  };
};
