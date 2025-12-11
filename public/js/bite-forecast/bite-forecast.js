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
    forecastScores: {},      // { species: [24 hourly scores] }
    selectedSpecies: [],      // Species shown on main graph
    favoriteSpecies: [],      // User's favorite species (saved to localStorage)
    currentHour: 0,           // 0-23 index for NOW
    cacheKey: null
  };

  /**
   * Load favorite species from localStorage
   */
  function loadFavorites() {
    try {
      const saved = localStorage.getItem('fishermn_favorite_species');
      if (saved) {
        state.favoriteSpecies = JSON.parse(saved);
        console.log('[BiteForecast] Loaded favorites:', state.favoriteSpecies);
      } else {
        // Default favorites if none saved
        state.favoriteSpecies = ['yellowPerch', 'walleye', 'blackCrappie'];
      }
    } catch (error) {
      console.warn('[BiteForecast] Could not load favorites:', error);
      state.favoriteSpecies = ['yellowPerch', 'walleye', 'blackCrappie'];
    }
  }

  /**
   * Save favorite species to localStorage
   */
  function saveFavorites() {
    try {
      localStorage.setItem('fishermn_favorite_species', JSON.stringify(state.favoriteSpecies));
      console.log('[BiteForecast] Saved favorites:', state.favoriteSpecies);
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
    console.log('[BiteForecast] Toggled favorite:', speciesId, 'Favorites:', state.favoriteSpecies);
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
      // Remove from graph
      state.selectedSpecies.splice(index, 1);
    } else {
      // Add to graph
      state.selectedSpecies.push(speciesId);
    }

    console.log('[BiteForecast] Selected species:', state.selectedSpecies);

    // Re-render main graph and species selector
    renderSpeciesSelector();
    renderMainGraph();
    renderSpeciesCards(); // Update button states
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
    console.log('[BiteForecast] Initializing...');

    // Check if already initialized with same data (cache check)
    const newCacheKey = generateCacheKey(weatherData);
    if (state.initialized && state.cacheKey === newCacheKey) {
      console.log('[BiteForecast] Using cached data');
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

      // Step 1: Interpolate 3-hour forecast to hourly data
      console.log('[BiteForecast] Interpolating weather data...');
      state.hourlyWeather = WeatherInterpolator.interpolate(
        weatherData.forecast.list,
        Date.now()
      );

      if (!state.hourlyWeather || state.hourlyWeather.length !== 24) {
        throw new Error('Weather interpolation failed');
      }

      // Step 2: Calculate sunrise/sunset times
      console.log('[BiteForecast] Calculating sun times...');
      state.sunTimes = WeatherAnalyzer.calculateSunTimes(
        lakeData.latitude,
        lakeData.longitude,
        new Date()
      );

      // Step 3: Detect storm events
      console.log('[BiteForecast] Detecting storm events...');
      state.stormEvents = WeatherAnalyzer.detectStormEvents(state.hourlyWeather);
      console.log(`[BiteForecast] Found ${state.stormEvents.length} storm events`);

      // Step 4: Fetch weather history (optional, for enhanced scoring)
      console.log('[BiteForecast] Fetching weather history...');
      try {
        const historyRes = await fetch(`/api/weather-history?lake_id=${lakeData.id}&days=7`);
        if (historyRes.ok) {
          state.weatherHistory = await historyRes.json();
          console.log(`[BiteForecast] Loaded ${state.weatherHistory?.length || 0} historical records`);
        } else {
          console.warn('[BiteForecast] Weather history not available (expected if database not set up yet)');
          state.weatherHistory = null;
        }
      } catch (err) {
        console.warn('[BiteForecast] Could not fetch weather history:', err.message);
        state.weatherHistory = null;
      }

      // Step 5: Calculate scores for all 20 species × 24 hours (480 scores)
      console.log('[BiteForecast] Calculating bite scores for 20 species...');
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

      console.log('[BiteForecast] Calculated 480 scores (20 species × 24 hours)');

      // Step 6: Load favorites and use as default selected species
      loadFavorites();
      state.selectedSpecies = [...state.favoriteSpecies]; // Use favorites as default

      console.log('[BiteForecast] Top 3 species:', state.selectedSpecies.map(id => {
        const profile = SpeciesProfiles.getProfile(id);
        return `${profile.name} (${state.forecastScores[id][0].score})`;
      }));

      // Step 7: Determine current hour (for NOW marker)
      state.currentHour = 0; // Always start at current time

      // Step 8: Render UI
      console.log('[BiteForecast] Rendering UI...');
      render();

      state.initialized = true;
      showContent();

      console.log('[BiteForecast] Initialization complete!');

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
   * Render main graph (shows 2-3 selected species)
   */
  function renderMainGraph() {
    console.log('[BiteForecast] renderMainGraph called');

    const canvas = document.getElementById('bite-forecast-chart');
    if (!canvas) {
      console.warn('[BiteForecast] Main graph canvas not found');
      return;
    }

    console.log('[BiteForecast] Canvas found:', canvas);

    // Prepare data for selected species
    const selectedScores = {};
    state.selectedSpecies.forEach(speciesId => {
      selectedScores[speciesId] = state.forecastScores[speciesId];
    });

    console.log('[BiteForecast] Selected scores prepared for species:', Object.keys(selectedScores));
    console.log('[BiteForecast] ChartRenderer available:', typeof ChartRenderer !== 'undefined');

    // Use ChartRenderer to draw
    if (typeof ChartRenderer !== 'undefined') {
      console.log('[BiteForecast] Calling ChartRenderer.renderMainChart...');
      ChartRenderer.renderMainChart(canvas, selectedScores, state.currentHour);
      console.log('[BiteForecast] ChartRenderer.renderMainChart completed');
    } else {
      console.error('[BiteForecast] ChartRenderer not loaded!');
      // Placeholder until ChartRenderer is implemented
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0A3A60';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Chart Renderer Not Loaded', canvas.width / 2, canvas.height / 2);
      }
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
