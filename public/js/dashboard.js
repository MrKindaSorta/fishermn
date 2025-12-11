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
      <div class="card py-3 px-4 hover:shadow-md transition-shadow cursor-pointer" data-lake-id="${lake.id}"
           onclick="window.location.href='/lake.html?id=${encodeURIComponent(lake.slug)}'">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="font-bold text-base">${lake.name}</h3>
            <p class="text-xs text-secondary">${lake.region || 'Minnesota'}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="unfavorite-btn p-2 rounded-lg bg-gold border-gold text-white hover:bg-gold/90 transition-colors"
                    data-lake-slug="${lake.slug}"
                    data-lake-name="${lake.name}"
                    title="Remove from favorites"
                    onclick="event.stopPropagation()">
              <svg class="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
            <span class="badge ${thicknessClass} text-white text-xs px-3 py-1">${thicknessValue}</span>
            <a href="/lake.html?id=${encodeURIComponent(lake.slug)}"
               class="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
               onclick="event.stopPropagation()">View</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners to unfavorite buttons
  document.querySelectorAll('.unfavorite-btn').forEach(btn => {
    btn.addEventListener('click', handleUnfavorite);
  });
}

/**
 * Handle unfavorite button click
 */
async function handleUnfavorite(event) {
  const btn = event.currentTarget;
  const slug = btn.dataset.lakeSlug;
  const name = btn.dataset.lakeName;

  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to remove ${name} from your favorites?`);
  if (!confirmed) return;

  // Disable button during request
  btn.disabled = true;
  btn.style.opacity = '0.5';

  try {
    const token = Auth.getToken();
    const response = await fetch(`/api/lakes/${slug}/favorite`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // Remove the lake card from DOM
      const card = btn.closest('.card');
      if (card) {
        card.style.transition = 'opacity 0.3s';
        card.style.opacity = '0';
        setTimeout(() => {
          card.remove();

          // Check if there are any remaining favorite cards
          const container = document.getElementById('favorite-lakes-container');
          const remainingCards = container?.querySelectorAll('.card');

          // If no cards left, show empty state
          if (!remainingCards || remainingCards.length === 0) {
            container.innerHTML = `
              <div class="card text-center py-12">
                <svg class="w-16 h-16 mx-auto text-grayPanel mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                <p class="text-secondary text-sm">No favorite lakes yet</p>
                <a href="/lakes.html" class="text-primary text-sm hover:underline mt-2 inline-block">Explore lakes →</a>
              </div>
            `;
          }
        }, 300);
      }
    } else {
      alert('Failed to remove favorite. Please try again.');
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  } catch (error) {
    console.error('[Dashboard] Error removing favorite:', error);
    alert('Failed to remove favorite. Please try again.');
    btn.disabled = false;
    btn.style.opacity = '1';
  }
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
