/**
 * Authentication Modal Controller
 * Handles login/signup modal interactions
 */

const AuthModal = {
  currentTab: 'signin',

  /**
   * Open the authentication modal
   * @param {string} defaultTab - 'signin' or 'signup'
   */
  open(defaultTab = 'signin') {
    const modal = document.getElementById('auth-modal');
    if (!modal) {
      console.error('[AuthModal] Modal element not found');
      return;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    this.switchTab(defaultTab);

    // Focus on first input
    setTimeout(() => {
      const firstInput = defaultTab === 'signin'
        ? document.getElementById('signin-email')
        : document.getElementById('signup-displayname');
      if (firstInput) firstInput.focus();
    }, 100);

    console.log('[AuthModal] Modal opened');
  },

  /**
   * Close the authentication modal
   */
  close() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    // Clear forms
    this.clearForms();

    console.log('[AuthModal] Modal closed');
  },

  /**
   * Switch between sign in and sign up tabs
   * @param {string} tab - 'signin' or 'signup'
   */
  switchTab(tab) {
    this.currentTab = tab;

    const signinTab = document.getElementById('tab-signin');
    const signupTab = document.getElementById('tab-signup');
    const signinForm = document.getElementById('form-signin');
    const signupForm = document.getElementById('form-signup');

    if (tab === 'signin') {
      signinTab.classList.add('border-primary', 'text-primary');
      signinTab.classList.remove('border-transparent', 'text-secondary');
      signupTab.classList.remove('border-primary', 'text-primary');
      signupTab.classList.add('border-transparent', 'text-secondary');

      signinForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
    } else {
      signupTab.classList.add('border-primary', 'text-primary');
      signupTab.classList.remove('border-transparent', 'text-secondary');
      signinTab.classList.remove('border-primary', 'text-primary');
      signinTab.classList.add('border-transparent', 'text-secondary');

      signupForm.classList.remove('hidden');
      signinForm.classList.add('hidden');
    }

    // Clear errors
    this.clearErrors();

    console.log('[AuthModal] Switched to', tab);
  },

  /**
   * Submit sign in form
   */
  async submitSignIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    // Client-side validation
    if (!email || !password) {
      this.showError('signin', 'Please enter both email and password');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('signin', 'Please enter a valid email address');
      return;
    }

    console.log('[AuthModal] Submitting sign in...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[AuthModal] Sign in successful');

        // Store auth token and user data
        Auth.setAuth(data.token, data.user);

        // Close modal
        this.close();

        // Reload page to show logged-in UI
        window.location.reload();
      } else {
        this.showError('signin', data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('[AuthModal] Sign in error:', error);
      this.showError('signin', 'Network error. Please try again.');
    }
  },

  /**
   * Submit sign up form
   */
  async submitSignUp() {
    const displayName = document.getElementById('signup-displayname').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Client-side validation
    if (!displayName || !email || !password) {
      this.showError('signup', 'Please fill in all fields');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showError('signup', 'Please enter a valid email address');
      return;
    }

    if (displayName.length < 3 || displayName.length > 20) {
      this.showError('signup', 'Display name must be 3-20 characters');
      return;
    }

    if (password.length < 8) {
      this.showError('signup', 'Password must be at least 8 characters');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      this.showError('signup', 'Password must contain uppercase, lowercase, and number');
      return;
    }

    console.log('[AuthModal] Submitting sign up...');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ displayName, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('[AuthModal] Sign up successful');

        // Store auth token and user data
        Auth.setAuth(data.token, data.user);

        // Close modal
        this.close();

        // Redirect to dashboard
        window.location.href = '/';
      } else {
        this.showError('signup', data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('[AuthModal] Sign up error:', error);
      this.showError('signup', 'Network error. Please try again.');
    }
  },

  /**
   * Sign in with Google
   */
  signInWithGoogle() {
    console.log('[AuthModal] Redirecting to Google OAuth...');
    window.location.href = '/api/auth/google';
  },

  /**
   * Show error message
   * @param {string} form - 'signin' or 'signup'
   * @param {string} message - Error message
   */
  showError(form, message) {
    const errorEl = document.getElementById(`${form}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  },

  /**
   * Clear error messages
   */
  clearErrors() {
    const signinError = document.getElementById('signin-error');
    const signupError = document.getElementById('signup-error');

    if (signinError) signinError.classList.add('hidden');
    if (signupError) signupError.classList.add('hidden');
  },

  /**
   * Clear form fields
   */
  clearForms() {
    const signinEmail = document.getElementById('signin-email');
    const signinPassword = document.getElementById('signin-password');
    const signupDisplayName = document.getElementById('signup-displayname');
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');

    if (signinEmail) signinEmail.value = '';
    if (signinPassword) signinPassword.value = '';
    if (signupDisplayName) signupDisplayName.value = '';
    if (signupEmail) signupEmail.value = '';
    if (signupPassword) signupPassword.value = '';

    this.clearErrors();
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
};

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    AuthModal.close();
  }

  // Handle Enter key in forms
  if (e.key === 'Enter') {
    const modal = document.getElementById('auth-modal');
    if (modal && !modal.classList.contains('hidden')) {
      if (AuthModal.currentTab === 'signin') {
        AuthModal.submitSignIn();
      } else {
        AuthModal.submitSignUp();
      }
    }
  }
});

// Export for use in other modules
window.AuthModal = AuthModal;
