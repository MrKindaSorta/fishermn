/**
 * Bite Forecast Main Controller
 *
 * Orchestrates the entire bite forecast system:
 * - Initializes on tab activation
 * - Fetches and processes weather data
 * - Calculates scores for all 20 species × 24 hours (480 scores)
 * - Manages UI state and rendering
 * - Handles user interactions
 *
 * @module BiteForecast
 */

const BiteForecast = (() => {
  'use strict';

  // State
  const state = {
    initialized: false,
    lake: null,
    weatherData: null,
    weatherHistory: null,
    hourlyWeather: null,
    sunTimes: null,
    stormEvents: null,
    forecastScores: {},       // { species: [24 hourly scores] } - 24h view
    forecast5Day: {},         // { species: [40 3-hour scores] } - 5day view
    selectedSpecies: [],      // Species shown on main graph
    favoriteSpecies: [],      // User's favorite species (saved to localStorage)
    currentHour: 0,           // 0-23 index for NOW
    currentView: '24h',       // '24h' or '5day'
    cacheKey: null,
    loadingStatus: {}         // Track which species 5-day data is loaded: { speciesId: 'loading'|'loaded'|'error' }
  };

  /**
   * Load favorite species from localStorage
   */
  function loadFavorites() {
    try {
      const saved = localStorage.getItem('fishermn_favorite_species');
      if (saved) {
        state.favoriteSpecies = JSON.parse(saved);
      } else {
        state.favoriteSpecies = ['yellowPerch', 'walleye', 'blackCrappie'];
      }
    } catch (error) {
      state.favoriteSpecies = ['yellowPerch', 'walleye', 'blackCrappie'];
    }
  }

  /**
   * Save favorite species to localStorage
   */
  function saveFavorites() {
    try {
      localStorage.setItem('fishermn_favorite_species', JSON.stringify(state.favoriteSpecies));
    } catch (error) {
      console.warn('[BiteForecast] Could not save favorites:', error);
    }
  }

  /**
   * Toggle species as favorite
   */
  function toggleFavorite(speciesId) {
    const index = state.favoriteSpecies.indexOf(speciesId);

    if (index > -1) {
      // Remove from favorites
      state.favoriteSpecies.splice(index, 1);
    } else {
      // Add to favorites
      state.favoriteSpecies.push(speciesId);
    }

    saveFavorites();
    renderSpeciesCards(); // Re-render to update star icons
  }

  /**
   * Check if species is favorite
   */
  function isFavorite(speciesId) {
    return state.favoriteSpecies.includes(speciesId);
  }

  /**
   * Toggle species on main graph
   */
  function toggleSpeciesOnGraph(speciesId) {
    const index = state.selectedSpecies.indexOf(speciesId);

    if (index > -1) {
      state.selectedSpecies.splice(index, 1);
    } else {
      state.selectedSpecies.push(speciesId);
    }

    // Re-render main graph and species selector
    renderSpeciesSelector();
    renderMainGraph();
    renderSpeciesCards();
  }

  /**
   * Check if species is on main graph
   */
  function isOnGraph(speciesId) {
    return state.selectedSpecies.includes(speciesId);
  }

  /**
   * Generate cache key from weather data
   */
  function generateCacheKey(weatherData) {
    if (!weatherData || !weatherData.forecast) return null;

    const first = weatherData.forecast.list[0];
    if (!first) return null;

    const key = JSON.stringify({
      temp: first.main?.temp || 0,
      pressure: first.main?.pressure || 0,
      timestamp: Math.floor(Date.now() / 300000) // 5-minute buckets
    });

    return btoa(key);
  }

  /**
   * Show loading state
   */
  function showLoading() {
    const loading = document.getElementById('bite-forecast-loading');
    const content = document.getElementById('bite-forecast-content');
    const error = document.getElementById('bite-forecast-error');

    if (loading) loading.classList.remove('hidden');
    if (content) content.classList.add('hidden');
    if (error) error.classList.add('hidden');
  }

  /**
   * Show error state
   */
  function showError(message) {
    const loading = document.getElementById('bite-forecast-loading');
    const content = document.getElementById('bite-forecast-content');
    const error = document.getElementById('bite-forecast-error');

    if (loading) loading.classList.add('hidden');
    if (content) content.classList.add('hidden');
    if (error) {
      error.classList.remove('hidden');
      const errorText = error.querySelector('p.text-secondary');
      if (errorText && message) {
        errorText.textContent = message;
      }
    }
  }

  /**
   * Show content (hide loading/error)
   */
  function showContent() {
    const loading = document.getElementById('bite-forecast-loading');
    const content = document.getElementById('bite-forecast-content');
    const error = document.getElementById('bite-forecast-error');

    if (loading) loading.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    if (error) error.classList.add('hidden');
  }

  /**
   * Initialize bite forecast system
   *
   * @param {object} lakeData - Lake information including coordinates
   * @param {object} weatherData - Weather data from lake-detail.js
   */
  async function init(lakeData, weatherData) {
    // Check if already initialized with same data (cache check)
    const newCacheKey = generateCacheKey(weatherData);
    if (state.initialized && state.cacheKey === newCacheKey) {
      showContent();
      return;
    }

    showLoading();

    try {
      // Validate inputs
      if (!lakeData || !lakeData.latitude || !lakeData.longitude) {
        throw new Error('Invalid lake data');
      }

      if (!weatherData || !weatherData.forecast || !weatherData.forecast.list) {
        throw new Error('Invalid weather data');
      }

      if (weatherData.forecast.list.length < 8) {
        throw new Error('Insufficient forecast data (need at least 24 hours)');
      }

      state.lake = lakeData;
      state.weatherData = weatherData;
      state.cacheKey = newCacheKey;

      // Interpolate weather data
      state.hourlyWeather = WeatherInterpolator.interpolate(
        weatherData.forecast.list,
        Date.now()
      );

      if (!state.hourlyWeather || state.hourlyWeather.length !== 24) {
        throw new Error('Weather interpolation failed');
      }

      // Calculate sun times
      state.sunTimes = WeatherAnalyzer.calculateSunTimes(
        lakeData.latitude,
        lakeData.longitude,
        new Date()
      );

      // Detect storm events
      state.stormEvents = WeatherAnalyzer.detectStormEvents(state.hourlyWeather);

      // Find weather region
      let region = null;
      try {
        const regionRes = await fetch(`/api/regions/find?lat=${lakeData.latitude}&lon=${lakeData.longitude}`);
        if (regionRes.ok) {
          region = await regionRes.json();
        }
      } catch (err) {
        console.warn('[BiteForecast] Region lookup failed:', err.message);
      }

      // Fetch weather history
      try {
        if (region) {
          const historyRes = await fetch(`/api/weather-history?region_id=${region.region_id}&days=7`);
          if (historyRes.ok) {
            state.weatherHistory = await historyRes.json();
          }
        }
      } catch (err) {
        console.warn('[BiteForecast] Weather history unavailable');
      }

      // Calculate scores
      const speciesIds = SpeciesProfiles.getSpeciesIds();
      speciesIds.forEach(speciesId => {
        state.forecastScores[speciesId] = ScoringEngine.calculateDailyScores(
          speciesId,
          state.hourlyWeather,
          state.sunTimes,
          state.stormEvents,
          lakeData.id,
          state.weatherHistory
        );
      });

      // Load favorites
      loadFavorites();
      state.selectedSpecies = [...state.favoriteSpecies];

      // Set current hour
      state.currentHour = 0;

      // Render UI
      render();

      // Initialize view toggle
      initViewToggle();

      // Start background loading
      startBackgroundLoading();

      state.initialized = true;
      showContent();

      console.log('[BiteForecast] ✓ Ready');

    } catch (error) {
      console.error('[BiteForecast] Initialization error:', error);
      showError(error.message || 'Unable to generate bite forecast');

      // Log to analytics if available
      if (typeof Analytics !== 'undefined') {
        Analytics.logError('bite_forecast_init_failed', error.message);
      }
    }
  }

  /**
   * Render the complete UI
   */
  function render() {
    renderSpeciesSelector();
    renderMainGraph();
    renderSpeciesCards();
  }

  /**
   * Render species selector chips (above main graph)
   */
  function renderSpeciesSelector() {
    const container = document.getElementById('species-selector');
    if (!container) return;

    const html = state.selectedSpecies.map(speciesId => {
      const profile = SpeciesProfiles.getProfile(speciesId);
      return `
        <div class="species-chip flex items-center gap-2 px-3 py-1 rounded-full border-2 text-sm font-medium"
             style="border-color: ${profile.color}; color: ${profile.color};">
          <span>${profile.icon}</span>
          <span>${profile.name}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  /**
   * Render main graph (shows selected species in current view)
   */
  function renderMainGraph() {
    const canvas = document.getElementById('bite-forecast-chart');
    if (!canvas) return;

    // Prepare data based on current view
    const selectedScores = {};

    if (state.currentView === '24h') {
      state.selectedSpecies.forEach(speciesId => {
        selectedScores[speciesId] = state.forecastScores[speciesId];
      });
    } else {
      state.selectedSpecies.forEach(speciesId => {
        if (state.forecast5Day[speciesId]) {
          selectedScores[speciesId] = state.forecast5Day[speciesId];
        }
      });
    }

    // Use ChartRenderer to draw
    if (typeof ChartRenderer !== 'undefined') {
      ChartRenderer.renderMainChart(canvas, selectedScores, state.currentHour, state.currentView);
    } else {
      console.error('[BiteForecast] ChartRenderer not loaded');
    }
  }

  /**
   * Render all species cards
   */
  function renderSpeciesCards() {
    const container = document.getElementById('species-cards-grid');
    if (!container) return;

    const speciesIds = SpeciesProfiles.getSpeciesIds();

    const cardsHTML = speciesIds.map(speciesId => {
      const profile = SpeciesProfiles.getProfile(speciesId);
      const forecast24h = state.forecastScores[speciesId];
      const currentScore = forecast24h[0];
      const bestTimes = ScoringEngine.findBestBiteTimes(forecast24h);

      const isGraphed = isOnGraph(speciesId);
      const isFav = isFavorite(speciesId);

      return `
        <div class="card p-4 hover:shadow-lg transition-all species-card"
             data-species="${speciesId}">

          <!-- Card Header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${profile.icon}</span>
              <div>
                <h4 class="font-bold text-sm">${profile.name}</h4>
                <p class="text-xs text-secondary">Current Bite</p>
              </div>
            </div>

            <!-- Right: Score + Favorite Star -->
            <div class="flex items-center gap-2">
              <!-- Favorite Button -->
              <button
                class="favorite-btn p-1 rounded hover:bg-frost transition-colors"
                onclick="BiteForecast.toggleFavorite('${speciesId}'); event.stopPropagation();"
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                <svg class="w-5 h-5 ${isFav ? 'fill-gold stroke-gold' : 'fill-none stroke-secondary'}"
                     viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>

              <!-- Current Score Badge -->
              <div class="text-center">
                <div class="text-3xl font-bold" style="color: ${currentScore.quality.color}">
                  ${currentScore.score}
                </div>
                <div class="text-xs font-semibold" style="color: ${currentScore.quality.color}">
                  ${currentScore.quality.label}
                </div>
              </div>
            </div>
          </div>

          <!-- Add/Remove from Graph Button -->
          <button
            class="w-full mb-3 py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${isGraphed ? 'border-primary bg-primary text-white' : 'border-grayPanel text-secondary hover:border-primary'}"
            onclick="BiteForecast.toggleSpeciesOnGraph('${speciesId}'); event.stopPropagation();">
            ${isGraphed ? '✓ On Main Graph' : '+ Add to Main Graph'}
          </button>

          <!-- Mini Sparkline Placeholder -->
          <div class="h-16 mb-3 bg-frost rounded relative">
            <canvas class="species-sparkline"
                    data-species="${speciesId}"
                    width="300"
                    height="64"></canvas>
          </div>

          <!-- Expand Indicator -->
          <div class="text-center">
            <button class="expand-toggle text-xs text-primary hover:underline">
              View Details ▼
            </button>
          </div>

          <!-- Expanded Content (hidden by default) -->
          <div class="species-details hidden mt-4 pt-4 border-t border-grayPanel space-y-4">
            <!-- Top Factors -->
            <div>
              <p class="text-xs font-semibold text-secondary mb-2">What's Affecting the Bite:</p>
              <div class="space-y-1">
                ${currentScore.factors.slice(0, 3).map(f => `
                  <div class="flex items-start gap-2 text-xs">
                    <span class="${f.impact > 0 ? 'text-evergreen' : 'text-danger'}">
                      ${f.impact > 0 ? '↑' : '↓'}
                    </span>
                    <span>${f.description}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Best Times -->
            <div>
              <p class="text-xs font-semibold text-secondary mb-2">Best Bite Windows:</p>
              ${bestTimes.length > 0 ? `
                <div class="space-y-2">
                  ${bestTimes.map((window, i) => `
                    <div class="bg-frost rounded p-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-medium">
                          #${i + 1}: ${ScoringEngine.formatTimeWindow(window.start, window.end)}
                        </span>
                        <span class="text-sm font-bold" style="color: ${ScoringEngine.getQualityLabel(window.peakScore).color}">
                          ${window.peakScore}
                        </span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="text-xs text-secondary">No excellent windows in next 24h</p>
              `}
            </div>

            <!-- Educational Content -->
            <div class="bg-gold/5 rounded-lg p-3">
              <p class="text-xs font-semibold text-primary mb-1">About ${profile.name} Feeding</p>
              <p class="text-xs text-secondary leading-relaxed">${profile.education.habits}</p>
              <p class="text-xs text-muted mt-2">
                <strong>Best Conditions:</strong> ${profile.education.bestConditions}
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = cardsHTML;

    // Attach event listeners
    attachCardListeners();

    // Render sparklines
    renderAllSparklines();
  }

  /**
   * Attach click handlers to species cards
   */
  function attachCardListeners() {
    const cards = document.querySelectorAll('.species-card');

    cards.forEach(card => {
      const expandToggle = card.querySelector('.expand-toggle');
      const detailsSection = card.querySelector('.species-details');

      if (expandToggle && detailsSection) {
        expandToggle.addEventListener('click', (e) => {
          e.stopPropagation();

          const isExpanded = !detailsSection.classList.contains('hidden');

          if (isExpanded) {
            detailsSection.classList.add('hidden');
            expandToggle.textContent = 'View Details ▼';
          } else {
            detailsSection.classList.remove('hidden');
            expandToggle.textContent = 'Hide Details ▲';
          }
        });
      }
    });
  }

  /**
   * Render all sparklines
   */
  function renderAllSparklines() {
    const sparklines = document.querySelectorAll('.species-sparkline');

    sparklines.forEach(canvas => {
      const speciesId = canvas.dataset.species;
      const scores = state.forecastScores[speciesId];

      if (scores && typeof ChartRenderer !== 'undefined') {
        ChartRenderer.renderSparkline(canvas, scores, state.currentHour);
      }
    });
  }

  /**
   * Calculate 120-hour scores properly using full hourly interpolation
   * Returns all 120 hourly data points for extended view
   */
  function calculate5DayScores(speciesId) {

    const forecast3h = state.weatherData.forecast.list;

    // Step 1: Interpolate full 5 days into hourly data (up to 120 hours)
    const hourlyData = [];
    const startTime = Date.now();

    // We can get up to 40 3-hour points, which gives us ~5 days
    const pointsAvailable = Math.min(40, forecast3h.length);

    for (let i = 0; i < pointsAvailable - 1; i++) {
      const current = forecast3h[i];
      const next = forecast3h[i + 1];

      // Interpolate between current and next (3 hours apart)
      for (let h = 0; h < 3; h++) {
        const ratio = h / 3;
        const time = new Date((current.dt + h * 3600) * 1000);

        hourlyData.push({
          dt: current.dt + h * 3600,
          time: time,
          temp: current.main.temp + ratio * (next.main.temp - current.main.temp),
          pressure: current.main.pressure + ratio * (next.main.pressure - current.main.pressure),
          humidity: Math.round(current.main.humidity + ratio * (next.main.humidity - current.main.humidity)),
          clouds: Math.round(current.clouds.all + ratio * (next.clouds.all - current.clouds.all)),
          windSpeed: current.wind.speed + ratio * (next.wind.speed - current.wind.speed),
          windDir: current.wind.deg + ratio * (next.wind.deg - current.wind.deg),
          pop: (current.pop || 0) + ratio * ((next.pop || 0) - (current.pop || 0)),
          weather: h < 1.5 ? current.weather[0] : next.weather[0],
          rain: (current.rain?.['3h'] || 0) / 3,
          snow: (current.snow?.['3h'] || 0) / 3
        });
      }
    }

    console.log(`[BiteForecast] Interpolated ${hourlyData.length} hours for 120-hour view`);

    // Step 2: Calculate scores for ALL hours (same as 24h view method)
    const allScores = [];

    // Process in daily chunks for proper sun time calculation
    const hoursToProcess = Math.min(120, hourlyData.length);

    for (let hour = 0; hour < hoursToProcess; hour++) {
      // Determine which day this hour belongs to
      const dayIndex = Math.floor(hour / 24);
      const baseTime = new Date(startTime + dayIndex * 86400000);

      // Calculate sun times for this day
      const sunTimes = WeatherAnalyzer.calculateSunTimes(
        state.lake.latitude,
        state.lake.longitude,
        baseTime
      );

      // Get the relevant 24-hour window for this hour
      const dayStart = dayIndex * 24;
      const dayEnd = Math.min(dayStart + 24, hourlyData.length);
      const dailyWeather = hourlyData.slice(dayStart, dayEnd);

      // Calculate score for this hour within its daily context
      const hourInDay = hour % 24;
      if (hourInDay < dailyWeather.length) {
        const score = ScoringEngine.calculateBiteScore(
          speciesId,
          hourInDay,
          dailyWeather,
          sunTimes,
          WeatherAnalyzer.detectStormEvents(dailyWeather),
          state.lake.id,
          state.weatherHistory
        );
        allScores.push(score);
      }
    }

    // Step 3: Return all hourly scores (no sampling for better detail)
    console.log(`[BiteForecast] Calculated ${allScores.length} hourly scores for 5-day view`);
    return allScores;
  }

  /**
   * Load 5-day data for a species in background
   */
  async function loadSpecies5DayData(speciesId) {
    if (state.loadingStatus[speciesId] === 'loaded' || state.loadingStatus[speciesId] === 'loading') {
      return; // Already loaded or loading
    }

    state.loadingStatus[speciesId] = 'loading';

    // Use setTimeout to not block UI
    setTimeout(() => {
      try {
        state.forecast5Day[speciesId] = calculate5DayScores(speciesId);
        state.loadingStatus[speciesId] = 'loaded';
        console.log(`[BiteForecast] 5-day data loaded for ${speciesId}`);

        // If currently in 5-day view and this species is selected, update graph
        if (state.currentView === '5day' && state.selectedSpecies.includes(speciesId)) {
          renderMainGraph();
        }
      } catch (error) {
        console.error(`[BiteForecast] Error loading 5-day data for ${speciesId}:`, error);
        state.loadingStatus[speciesId] = 'error';
      }
    }, 10);
  }

  /**
   * Start background loading for selected species
   */
  function startBackgroundLoading() {
    console.log('[BiteForecast] Starting background 120-hour data loading for selected species...');

    // Load selected species first (priority)
    state.selectedSpecies.forEach((speciesId, index) => {
      setTimeout(() => loadSpecies5DayData(speciesId), index * 50);
    });

    // Load all other species in background (lower priority)
    const allSpecies = SpeciesProfiles.getSpeciesIds();
    const otherSpecies = allSpecies.filter(id => !state.selectedSpecies.includes(id));

    otherSpecies.forEach((speciesId, index) => {
      setTimeout(() => loadSpecies5DayData(speciesId), 500 + index * 100);
    });
  }

  /**
   * Switch between 24h and 5day views
   */
  function switchView(newView) {
    if (newView !== '24h' && newView !== '5day') {
      console.error('[BiteForecast] Invalid view:', newView);
      return;
    }

    console.log(`[BiteForecast] Switching to ${newView} view`);
    state.currentView = newView;

    // Update button states
    const btn24h = document.getElementById('view-24h');
    const btn5day = document.getElementById('view-5day');

    if (btn24h && btn5day) {
      if (newView === '24h') {
        btn24h.classList.add('bg-primary', 'text-white');
        btn24h.classList.remove('text-secondary');
        btn5day.classList.remove('bg-primary', 'text-white');
        btn5day.classList.add('text-secondary');
      } else {
        btn5day.classList.add('bg-primary', 'text-white');
        btn5day.classList.remove('text-secondary');
        btn24h.classList.remove('bg-primary', 'text-white');
        btn24h.classList.add('text-secondary');
      }
    }

    // Re-render main graph with new view
    renderMainGraph();
  }

  /**
   * Initialize view toggle buttons
   */
  function initViewToggle() {
    const btn24h = document.getElementById('view-24h');
    const btn5day = document.getElementById('view-5day');

    if (btn24h) {
      btn24h.addEventListener('click', () => switchView('24h'));
    }

    if (btn5day) {
      btn5day.addEventListener('click', () => switchView('5day'));
    }
  }

  /**
   * Refresh forecast (re-fetch weather and recalculate)
   */
  async function refresh() {
    if (!state.lake || !state.weatherData) {
      console.warn('[BiteForecast] Cannot refresh - not initialized');
      return;
    }

    console.log('[BiteForecast] Refreshing forecast...');
    state.initialized = false; // Force re-initialization
    await init(state.lake, state.weatherData);
  }

  /**
   * Public API
   */
  return {
    /**
     * Initialize bite forecast
     */
    init,

    /**
     * Refresh forecast data
     */
    refresh,

    /**
     * Switch view (24h or 5day)
     */
    switchView,

    /**
     * Toggle species on main graph
     */
    toggleSpeciesOnGraph,

    /**
     * Toggle species as favorite
     */
    toggleFavorite,

    /**
     * Check if species is on graph
     */
    isOnGraph,

    /**
     * Check if species is favorite
     */
    isFavorite,

    /**
     * Get current state (for debugging)
     */
    getState: () => state,

    /**
     * Check if initialized
     */
    get initialized() {
      return state.initialized;
    },

    /**
     * Expose for external access
     */
    forecastScores: state.forecastScores,
    selectedSpecies: state.selectedSpecies,
    favoriteSpecies: state.favoriteSpecies
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BiteForecast;
}

// Make available globally
window.BiteForecast = BiteForecast;
