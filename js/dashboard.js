/**
 * Dashboard Dynamic Data Loader
 * Loads real user data from Auth and populates dashboard
 */

function loadDashboardData() {
  const user = Auth.getUser();

  if (!user) {
    console.warn('[Dashboard] No user data available');
    return;
  }

  console.log('[Dashboard] Loading data for user:', user.displayName);

  // Update rank card
  const rankTitle = document.getElementById('user-rank-title');
  const rankLevel = document.getElementById('user-rank-level');
  const userXP = document.getElementById('user-xp');

  if (rankTitle) rankTitle.textContent = `${user.rankTier} ${user.rankBand}`;
  if (rankLevel) rankLevel.textContent = `Level ${user.rankLevel} • ★★★★☆ ${user.reliabilityScore}`;
  if (userXP) userXP.textContent = user.xp;

  // Update quick stats
  const iceReportsEl = document.getElementById('stat-ice-reports');
  const catchReportsEl = document.getElementById('stat-catch-reports');
  const lakesVisitedEl = document.getElementById('stat-lakes-visited');

  if (iceReportsEl) iceReportsEl.textContent = user.iceReports || 0;
  if (catchReportsEl) catchReportsEl.textContent = user.catchReports || 0;
  if (lakesVisitedEl) lakesVisitedEl.textContent = user.lakesVisited || 0;

  // Update XP progress bar
  const xpCurrent = document.getElementById('xp-current');
  const xpNext = document.getElementById('xp-next');
  const xpBar = document.getElementById('xp-bar');
  const xpToGo = document.getElementById('xp-to-go');

  if (xpCurrent) xpCurrent.textContent = user.xp;
  if (xpNext) xpNext.textContent = user.nextLevelXp?.toLocaleString() || '?';

  if (xpBar && user.nextLevelXp) {
    const percentage = Math.round((user.xp / user.nextLevelXp) * 100);
    xpBar.style.width = `${percentage}%`;
  }

  if (xpToGo && user.nextLevelXp) {
    const remaining = user.nextLevelXp - user.xp;
    xpToGo.textContent = remaining;
  }

  // Determine next rank
  const nextRank = document.getElementById('next-rank');
  if (nextRank && user.rankTier && user.rankBand) {
    // Simple logic: assume next level is next band in same tier
    const bands = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    const currentBandIndex = bands.indexOf(user.rankBand);

    if (currentBandIndex < 3) {
      nextRank.textContent = `${user.rankTier} ${bands[currentBandIndex + 1]}`;
    } else {
      nextRank.textContent = 'Next Tier';
    }
  }

  console.log('[Dashboard] User data loaded successfully');
}

// Load dashboard data when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Wait for auth to initialize
  setTimeout(() => {
    if (Auth.isAuthenticated()) {
      loadDashboardData();
    }
  }, 200);
});
