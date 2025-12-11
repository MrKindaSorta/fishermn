/**
 * Dashboard Dynamic Data Loader
 * Loads real user data from Auth and populates dashboard
 */

/**
 * Load user's favorite lakes from API
 */
async function loadFavoriteLakes() {
  const token = Auth.getToken();
  if (!token) return [];

  try {
    const response = await Auth.fetchWithAuth('/api/user/favorites');
    const data = await response.json();
    return data.success ? (data.favoriteLakes || []) : [];
  } catch (error) {
    console.error('[Dashboard] Error loading favorites:', error);
    return [];
  }
}

/**
 * Render favorite lakes cards
 */
function renderFavoriteLakes(lakes) {
  const container = document.getElementById('favorite-lakes-container');
  if (!container || !lakes || lakes.length === 0) return;

  // Replace empty state with lake cards
  container.innerHTML = lakes.map(lake => {
    const thickness = lake.officialIce?.thickness || null;
    const thicknessValue = thickness !== null ? `${thickness}"` : '--';
    const thicknessClass = getThicknessClass(thickness);

    return `
      <div class="card py-3 px-4 hover:shadow-md transition-shadow cursor-pointer"
           onclick="window.location.href='/lake.html?id=${encodeURIComponent(lake.slug)}'">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="font-bold text-base">${lake.name}</h3>
            <p class="text-xs text-secondary">${lake.region || 'Minnesota'}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${thicknessClass} text-white text-xs px-3 py-1">${thicknessValue}</span>
            <a href="/lake.html?id=${encodeURIComponent(lake.slug)}"
               class="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
               onclick="event.stopPropagation()">View</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Get CSS class for ice thickness badge
 */
function getThicknessClass(thickness) {
  if (!thickness || thickness < 6) return 'bg-orange';
  if (thickness < 12) return 'bg-gold';
  return 'bg-evergreen';
}

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

  // Load and render favorite lakes
  loadFavoriteLakes()
    .then(lakes => renderFavoriteLakes(lakes))
    .catch(error => console.error('[Dashboard] Failed to render favorites:', error));
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
