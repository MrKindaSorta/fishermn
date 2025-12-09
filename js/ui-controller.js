/**
 * UI Controller - Manages conditional rendering based on auth state
 * Handles page-specific restrictions for logged-out users
 */

const UIController = {
  /**
   * Initialize UI based on authentication state
   */
  init() {
    const isLoggedIn = Auth.isAuthenticated();

    console.log('[UIController] Initializing, isLoggedIn:', isLoggedIn);

    if (!isLoggedIn) {
      this.applyPageRestrictions();
    }

    console.log('[UIController] Initialization complete');
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
  UIController.init();
});

// Export for use in other modules
window.UIController = UIController;
