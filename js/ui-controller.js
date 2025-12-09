/**
 * UI Controller - Manages conditional rendering based on auth state
 * Handles logged-in vs logged-out user experiences
 */

const UIController = {
  /**
   * Initialize UI based on authentication state
   */
  init() {
    const isLoggedIn = Auth.isAuthenticated();

    console.log('[UIController] Initializing, isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
      this.renderLoggedInUI();
    } else {
      this.renderLoggedOutUI();
    }
  },

  /**
   * Render UI for logged-in users
   */
  renderLoggedInUI() {
    console.log('[UIController] Rendering logged-in UI');

    // Show all navigation items (Dashboard and Profile)
    this.showElementsByAttribute('data-auth-required', 'true');

    // Load user info in navigation
    this.loadUserInfo();

    // Enable Add Report button (default functionality)
    // No changes needed - existing onclick handlers work

    console.log('[UIController] Logged-in UI rendered');
  },

  /**
   * Render UI for logged-out users
   */
  renderLoggedOutUI() {
    console.log('[UIController] Rendering logged-out UI');

    // Hide Dashboard and Profile nav items
    this.hideElementsByAttribute('data-auth-required', 'true');

    // Replace user info with Login/Sign Up button in sidebar
    this.loadGuestSidebar();

    // Update Add Report button to trigger login
    this.updateAddReportForGuest();

    // Apply page-specific restrictions
    this.applyPageRestrictions();

    console.log('[UIController] Logged-out UI rendered');
  },

  /**
   * Show elements with specific data attribute
   * @param {string} attribute - Data attribute name
   * @param {string} value - Attribute value
   */
  showElementsByAttribute(attribute, value) {
    const elements = document.querySelectorAll(`[${attribute}="${value}"]`);
    elements.forEach(el => {
      el.style.display = '';
    });
  },

  /**
   * Hide elements with specific data attribute
   * @param {string} attribute - Data attribute name
   * @param {string} value - Attribute value
   */
  hideElementsByAttribute(attribute, value) {
    const elements = document.querySelectorAll(`[${attribute}="${value}"]`);
    elements.forEach(el => {
      el.style.display = 'none';
    });
  },

  /**
   * Load user info in navigation (logged in)
   */
  loadUserInfo() {
    const user = Auth.getUser();
    if (!user) return;

    // Wait for sidebar to load via HTMX
    const checkInterval = setInterval(() => {
      const initialsEl = document.getElementById('sidebar-initials');
      const usernameEl = document.getElementById('sidebar-username');
      const levelXpEl = document.getElementById('sidebar-level-xp');

      if (initialsEl && usernameEl && levelXpEl) {
        clearInterval(checkInterval);

        // Generate initials from display name
        const initials = user.displayName ? user.displayName.substring(0, 2).toUpperCase() : '?';

        // Update user info with actual data
        initialsEl.textContent = initials;
        usernameEl.textContent = user.displayName;
        levelXpEl.textContent = `Level ${user.rankLevel} • ${user.xp} XP`;

        console.log('[UIController] User info updated');
      }
    }, 100);

    // Clear interval after 5 seconds to prevent memory leak
    setTimeout(() => clearInterval(checkInterval), 5000);
  },

  /**
   * Load guest sidebar with Login button
   */
  loadGuestSidebar() {
    const checkInterval = setInterval(() => {
      const userInfoSection = document.querySelector('aside > div:last-child');

      if (userInfoSection) {
        clearInterval(checkInterval);

        // Replace user info with Login button
        userInfoSection.innerHTML = `
          <button
            onclick="AuthModal.open()"
            class="w-full px-4 py-3 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-colors text-center"
          >
            Login / Sign Up
          </button>
        `;

        console.log('[UIController] Guest sidebar loaded');
      }
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 5000);
  },

  /**
   * Update Add Report button to trigger login for guests
   */
  updateAddReportForGuest() {
    const checkInterval = setInterval(() => {
      const addReportBtn = document.querySelector('aside button.bg-gold');

      if (addReportBtn && addReportBtn.textContent.includes('Add Report')) {
        clearInterval(checkInterval);

        // Replace onclick handler
        addReportBtn.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          AuthModal.open();
        };

        console.log('[UIController] Add Report button updated for guest');
      }
    }, 100);

    setTimeout(() => clearInterval(checkInterval), 5000);
  },

  /**
   * Apply page-specific restrictions for logged-out users
   */
  applyPageRestrictions() {
    const currentPath = window.location.pathname;

    console.log('[UIController] Applying restrictions for:', currentPath);

    // Redirect from Dashboard to Lakes if logged out
    if (currentPath === '/' || currentPath === '/index.html') {
      console.log('[UIController] Redirecting from Dashboard to Lakes');
      window.location.replace('/lakes.html');
      return;
    }

    // Redirect from Profile to Lakes if logged out
    if (currentPath === '/profile.html' || currentPath === '/profile') {
      console.log('[UIController] Redirecting from Profile to Lakes');
      window.location.replace('/lakes.html');
      return;
    }

    // Apply blur overlay on Discussions
    if (currentPath === '/discussions.html' || currentPath === '/discussions') {
      this.applyBlurOverlay(
        'Discussions',
        'Join FisherMN to participate in discussions with the community!'
      );
    }

    // Apply blur overlay on Leaderboards
    if (currentPath === '/leaderboards.html' || currentPath === '/leaderboards') {
      this.applyBlurOverlay(
        'Leaderboards',
        'Login to view rankings and compete for season prizes!'
      );
    }
  },

  /**
   * Apply blur overlay to page content
   * @param {string} pageTitle - Title for overlay
   * @param {string} message - Message for overlay
   */
  applyBlurOverlay(pageTitle, message) {
    // Wait for main content to load
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      if (!mainContent) return;

      // Add blur effect to main content
      mainContent.style.filter = 'blur(8px)';
      mainContent.style.pointerEvents = 'none';
      mainContent.style.userSelect = 'none';

      // Create overlay
      const overlay = document.createElement('div');
      overlay.id = 'auth-overlay';
      overlay.className = 'fixed inset-0 z-40 flex items-center justify-center bg-black/30';
      overlay.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
          <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-primary mb-3">${pageTitle} - Members Only</h2>
          <p class="text-secondary mb-6">${message}</p>
          <button
            onclick="AuthModal.open()"
            class="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors mb-3"
          >
            Login / Sign Up
          </button>
          <a href="/lakes.html" class="block text-sm text-primary hover:underline">
            Continue browsing lakes →
          </a>
        </div>
      `;

      document.body.appendChild(overlay);

      console.log('[UIController] Blur overlay applied to', pageTitle);
    }, 200);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for HTMX partials to load
  setTimeout(() => {
    UIController.init();
  }, 150);
});

// Export for use in other modules
window.UIController = UIController;
