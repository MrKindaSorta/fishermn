// Set active navigation link based on current page
function setActiveNavLink() {
  // Get current page path
  const currentPath = window.location.pathname;
  console.log('[Nav] Current path:', currentPath);

  // Define path mappings
  const pathMap = {
    '/': 'nav-dashboard',
    '/index.html': 'nav-dashboard',
    '/lakes.html': 'nav-lakes',
    '/lakes': 'nav-lakes',
    '/lake.html': 'nav-lakes',
    '/lake': 'nav-lakes',
    '/discussions.html': 'nav-discussions',
    '/discussions': 'nav-discussions',
    '/leaderboards.html': 'nav-leaderboards',
    '/leaderboards': 'nav-leaderboards',
    '/profile.html': 'nav-profile',
    '/profile': 'nav-profile'
  };

  // Get the nav link ID for current path (default to lakes for unknown paths)
  const activeLinkId = pathMap[currentPath] || 'nav-lakes';
  console.log('[Nav] Mapped to ID:', activeLinkId);

  // Remove active classes from all nav links
  const navLinks = document.querySelectorAll('[id^="nav-"]');
  if (navLinks.length === 0) {
    console.warn('[Nav] No nav links found - sidebar may not be loaded yet');
    return;
  }

  navLinks.forEach(link => {
    link.classList.remove('bg-white/10', 'text-white', 'font-medium');
    link.classList.add('text-white/70', 'hover:bg-white/5', 'hover:text-white', 'transition-all');
  });

  // Add active classes to current page link
  const activeLink = document.getElementById(activeLinkId);
  if (!activeLink) {
    console.error('[Nav] Active link not found:', activeLinkId);
    return;
  }

  activeLink.classList.remove('text-white/70', 'hover:bg-white/5', 'hover:text-white', 'transition-all');
  activeLink.classList.add('bg-white/10', 'text-white', 'font-medium');
  console.log('[Nav] Successfully highlighted:', activeLink.textContent.trim());
}

// Simple approach: Retry multiple times with increasing delays to ensure sidebar is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Nav] DOMContentLoaded fired, attempting to highlight nav');

  // Try immediately
  if (document.getElementById('nav-dashboard')) {
    console.log('[Nav] Sidebar found immediately, highlighting');
    setActiveNavLink();
    return;
  }

  // Retry at 200ms
  setTimeout(() => {
    if (document.getElementById('nav-dashboard')) {
      console.log('[Nav] Sidebar found at 200ms, highlighting');
      setActiveNavLink();
    }
  }, 200);

  // Retry at 500ms
  setTimeout(() => {
    if (document.getElementById('nav-dashboard')) {
      console.log('[Nav] Sidebar found at 500ms, highlighting');
      setActiveNavLink();
    }
  }, 500);

  // Final retry at 1000ms
  setTimeout(() => {
    if (document.getElementById('nav-dashboard')) {
      console.log('[Nav] Sidebar found at 1000ms, highlighting');
      setActiveNavLink();
    } else {
      console.error('[Nav] Sidebar not found after 1000ms - navigation highlighting failed');
    }
  }, 1000);
});
