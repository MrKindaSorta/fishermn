/**
 * Frontend Authentication State Manager
 * Manages JWT tokens and user data in localStorage
 */

const Auth = {
  // Storage keys
  TOKEN_KEY: 'fishermn_auth_token',
  USER_KEY: 'fishermn_user_data',

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has a valid token
   */
  isAuthenticated() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;

    // Check if token is expired
    try {
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
      return false;
    }
  },

  /**
   * Get current user data from localStorage
   * @returns {Object|null} User object or null if not logged in
   */
  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }
  },

  /**
   * Set authentication data after successful login/register
   * @param {string} token - JWT token
   * @param {Object} userData - User object
   */
  setAuth(token, userData) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    console.log('[Auth] User authenticated:', userData.displayName);
  },

  /**
   * Clear authentication data (logout)
   */
  clearAuth() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    console.log('[Auth] User logged out');
  },

  /**
   * Get authentication token for API requests
   * @returns {string|null} JWT token or null if not logged in
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
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
