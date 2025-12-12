/**
 * Mobile Navigation Controller
 *
 * Handles hamburger menu toggle for mobile devices:
 * - Opens/closes sidebar on mobile
 * - Manages backdrop overlay
 * - Auto-closes menu when navigation links are clicked
 * - Prevents body scroll when menu is open
 *
 * Uses event delegation to work with HTMX-loaded elements
 */

const MobileNav = {
  toggle() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar?.classList.contains('-translate-x-full')) {
      this.open();
    } else {
      this.close();
    }
  },

  open() {
    const sidebar = document.getElementById('mobile-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebar && backdrop) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  },

  close() {
    const sidebar = document.getElementById('mobile-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebar && backdrop) {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
};

// Use event delegation - works even when elements load after page
document.addEventListener('click', (e) => {
  // Hamburger button click
  if (e.target.closest('#mobile-menu-toggle')) {
    e.preventDefault();
    MobileNav.toggle();
    return;
  }

  // Backdrop click
  if (e.target.id === 'sidebar-backdrop') {
    e.preventDefault();
    MobileNav.close();
    return;
  }

  // Navigation link click in sidebar (auto-close)
  const sidebar = document.getElementById('mobile-sidebar');
  if (sidebar && e.target.closest('#mobile-sidebar a')) {
    setTimeout(() => MobileNav.close(), 150);
  }
});
