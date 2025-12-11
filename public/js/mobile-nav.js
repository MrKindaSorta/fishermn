/**
 * Mobile Navigation Controller
 *
 * Handles hamburger menu toggle for mobile devices:
 * - Opens/closes sidebar on mobile
 * - Manages backdrop overlay
 * - Auto-closes menu when navigation links are clicked
 * - Prevents body scroll when menu is open
 */

const MobileNav = {
  init() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('mobile-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    // Toggle button
    toggle?.addEventListener('click', () => this.toggle());

    // Backdrop click closes
    backdrop?.addEventListener('click', () => this.close());

    // Auto-close on navigation link click
    const navLinks = sidebar?.querySelectorAll('a');
    navLinks?.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(() => this.close(), 150);
      });
    });
  },

  toggle() {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar?.classList.contains('-translate-x-full')) {
      this.open();
    } else {
      this.close();
    }
  },

  open() {
    document.getElementById('mobile-sidebar')?.classList.remove('-translate-x-full');
    document.getElementById('sidebar-backdrop')?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  close() {
    document.getElementById('mobile-sidebar')?.classList.add('-translate-x-full');
    document.getElementById('sidebar-backdrop')?.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => MobileNav.init());
