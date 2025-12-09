/**
 * Frontend Authentication State Manager
 * Manages JWT tokens and user data in localStorage
 */

const Auth = {
  // Storage keys
  TOKEN_KEY: 'fishermn_auth_token',
  USER_KEY: 'fishermn_user_data',
  _storageAvailable: null, // Cache storage availability check

  /**
   * Check if localStorage is available (not blocked by tracking prevention)
   * @returns {boolean} True if localStorage can be used
   */
  isStorageAvailable() {
    if (this._storageAvailable !== null) {
      return this._storageAvailable;
    }

    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this._storageAvailable = true;
      return true;
    } catch (e) {
      console.warn('[Auth] localStorage unavailable (tracking prevention):', e.message);
      this._storageAvailable = false;
      return false;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a valid token
   */
  isAuthenticated() {
    if (!this.isStorageAvailable()) {
      return false; // Treat as logged out if storage blocked
    }

    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return false;

      // Check if token is expired
      const payload = this.decodeToken(token);
      if (payload && payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          // Token expired, clear it
          this.clearAuth();
          return false;
        }
      }
      return true;
    } catch (e) {
      console.error('[Auth] Error checking authentication:', e);
      return false;
    }
  },

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User object or null if not logged in
   */
  getUser() {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (e) {
      console.error('[Auth] Error getting user data:', e);
      return null;
    }
  },

  /**
   * Set authentication data after successful login/register
   * @param {string} token - JWT token
   * @param {Object} userData - User object
   * @returns {boolean} True if auth was saved successfully
   */
  setAuth(token, userData) {
    if (!this.isStorageAvailable()) {
      console.warn('[Auth] Cannot save auth - localStorage blocked');
      return false;
    }

    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      console.log('[Auth] User authenticated:', userData.displayName);
      return true;
    } catch (e) {
      console.error('[Auth] Error saving auth:', e);
      return false;
    }
  },

  /**
   * Clear authentication data (logout)
   */
  clearAuth() {
    if (!this.isStorageAvailable()) {
      return; // Nothing to clear if storage unavailable
    }

    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('[Auth] User logged out');
    } catch (e) {
      console.error('[Auth] Error clearing auth:', e);
    }
  },

  /**
   * Get authentication token for API requests
   * @returns {string|null} JWT token or null if not logged in
   */
  getToken() {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('[Auth] Error getting token:', e);
      return null;
    }
  },

  /**
   * Decode JWT token (client-side, no verification)
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded payload or null if invalid
   */
  decodeToken(token) {
    try {
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Might be base64 encoded for development
        const decoded = JSON.parse(atob(token));
        return decoded;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  },

  /**
   * Make an authenticated API request
   * @param {string} url - API endpoint URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    // Add Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If unauthorized, clear auth and redirect to login
    if (response.status === 401) {
      console.warn('[Auth] Unauthorized response, clearing auth');
      this.clearAuth();
      window.location.href = '/lakes.html';
    }

    return response;
  },

  /**
   * Logout user and redirect to lakes page
   */
  async logout() {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear local storage
    this.clearAuth();

    // Redirect to lakes page
    window.location.href = '/lakes.html';
  }
};

// Export for use in other modules
window.Auth = Auth;
