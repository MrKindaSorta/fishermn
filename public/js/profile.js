/**
 * Profile Page Dynamic Data Loader
 * Loads real user data from Auth and populates profile page
 */

function loadProfileData() {
  const user = Auth.getUser();

  if (!user) {
    console.warn('[Profile] No user data available');
    return;
  }

  console.log('[Profile] Loading data for user:', user.displayName);

  // Update profile header
  const displayNameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-email');
  const rankBadgeEl = document.getElementById('profile-rank-badge');
  const initialsEl = document.getElementById('profile-initials');

  if (displayNameEl) displayNameEl.value = user.displayName;
  if (emailEl) emailEl.value = user.email;
  if (rankBadgeEl) rankBadgeEl.textContent = `${user.rankTier} ${user.rankBand}`;

  // Generate initials
  if (initialsEl && user.displayName) {
    const initials = user.displayName.substring(0, 2).toUpperCase();
    initialsEl.textContent = initials;
  }

  // Update rank info
  const levelEl = document.getElementById('profile-level');
  const xpEl = document.getElementById('profile-xp');

  if (levelEl) levelEl.textContent = `Level ${user.rankLevel}`;
  if (xpEl) xpEl.textContent = `${user.xp} / ${user.nextLevelXp || '?'} XP`;

  // Update stats
  const iceReportsEl = document.getElementById('profile-ice-reports');
  const catchReportsEl = document.getElementById('profile-catch-reports');
  const totalReportsEl = document.getElementById('profile-total-reports');
  const rankPositionEl = document.getElementById('profile-rank-position');

  if (iceReportsEl) iceReportsEl.textContent = user.iceReports || 0;
  if (catchReportsEl) catchReportsEl.textContent = user.catchReports || 0;
  if (totalReportsEl) totalReportsEl.textContent = (user.iceReports || 0) + (user.catchReports || 0);
  if (rankPositionEl) rankPositionEl.textContent = '-'; // TODO: Calculate from leaderboard

  console.log('[Profile] User data loaded successfully');
}

// Load profile data when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    if (Auth.isAuthenticated()) {
      loadProfileData();
    }
  }, 200);
});
