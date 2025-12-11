/**
 * Lake Detail Page Controller
 * Handles loading and displaying lake data from the API
 * Includes tabs, POI map, weather, activity feed, and discussions
 */

const LakeDetail = {
  lake: null,
  iceReports: [],
  catchReports: [],
  snowReports: [],
  lakeUpdates: [],
  businesses: [],
  discussions: [],
  weather: null,
  map: null,
  markers: {},
  currentThread: null,
  currentActivityFilter: 'all',

  // Weather API base URL
  WEATHER_API_URL: 'https://weather-api-proxy.joshua-r-klimek.workers.dev',

  // POI type configuration
  POI_TYPES: {
    BAIT: { icon: '🎣', label: 'Bait Shop', color: '#1D4D3C' },
    BAR: { icon: '🍺', label: 'Bar', color: '#D4AF37' },
    RESORT: { icon: '🏨', label: 'Resort/Lodging', color: '#0A3A60' },
    CASINO: { icon: '🎰', label: 'Casino', color: '#DC2626' },
    OTHER: { icon: '📍', label: 'Other', color: '#4B5563' }
  },

  // Activity post types
  ACTIVITY_TYPES: {
    catch: { icon: '🎣', label: 'CATCH REPORT', color: '#1D4D3C' },
    ice: { icon: '⚠️', label: 'ICE CONDITION', color: '#DC2626' },
    snow: { icon: '❄️', label: 'SNOW REPORT', color: '#3B82F6' },
    hotspot: { icon: '📍', label: 'HOTSPOT', color: '#D4AF37' },
    photo: { icon: '📸', label: 'PHOTO', color: '#0A3A60' },
    general: { icon: '💬', label: 'UPDATE', color: '#4B5563' }
  },

  // Weather icons - map OpenWeatherMap icon codes to emojis
  WEATHER_ICONS: {
    sunny: '☀️',
    cloudy: '☁️',
    snow: '❄️',
    rain: '🌧️',
    storm: '⛈️'
  },

  // Map OpenWeatherMap icon codes to our icon names
  WEATHER_CODE_MAP: {
    '01d': 'sunny', '01n': 'sunny',      // Clear
    '02d': 'cloudy', '02n': 'cloudy',    // Few clouds
    '03d': 'cloudy', '03n': 'cloudy',    // Scattered clouds
    '04d': 'cloudy', '04n': 'cloudy',    // Broken clouds
    '09d': 'rain', '09n': 'rain',        // Shower rain
    '10d': 'rain', '10n': 'rain',        // Rain
    '11d': 'storm', '11n': 'storm',      // Thunderstorm
    '13d': 'snow', '13n': 'snow',        // Snow
    '50d': 'cloudy', '50n': 'cloudy'     // Mist
  },

  /**
   * Initialize the lake detail page
   */
  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('id');

    if (!slug) {
      window.location.href = '/lakes.html';
      return;
    }

    // Initialize tabs with auth-based visibility
    this.initTabsWithAuth();

    // Initialize button handlers
    this.initButtons();

    // Load all data
    await this.loadLakeData(slug);
  },

  /**
   * Initialize tabs with authentication-based visibility
   */
  initTabsWithAuth() {
    const isAuthenticated = typeof Auth !== 'undefined' && Auth.isAuthenticated();

    // Get all tab buttons
    const activityTab = document.querySelector('[data-tab="activity"]');
    const discussionsTab = document.querySelector('[data-tab="discussions"]');

    if (!isAuthenticated) {
      // Hide Activity and Discussions tabs for logged-out users
      if (activityTab) activityTab.style.display = 'none';
      if (discussionsTab) discussionsTab.style.display = 'none';
    } else {
      // Show all tabs for authenticated users
      if (activityTab) activityTab.style.display = '';
      if (discussionsTab) discussionsTab.style.display = '';
    }

    // Initialize regular tab switching
    this.initTabs();
  },

  /**
   * Initialize tab switching
   */
  initTabs() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        // Update button states
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
          if (content.id === `tab-${tabId}`) {
            content.classList.add('active');
          }
        });

        // Fix map display when switching to overview tab
        if (tabId === 'overview' && this.map) {
          setTimeout(() => this.map.invalidateSize(), 100);
        }
      });
    });
  },

  /**
   * Initialize button handlers
   */
  initButtons() {
    // Favorite button
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => this.toggleFavorite());
    }

    // Add report button
    const addReportBtn = document.getElementById('add-report-btn');
    if (addReportBtn) {
      addReportBtn.addEventListener('click', () => this.showAddReportForm());
    }
  },

  /**
   * Load lake data from API
   */
  async loadLakeData(slug) {
    try {
      const token = localStorage.getItem('fishermn_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Load lake data, businesses, discussions, and updates in parallel
      const [lakeResponse, businessesResponse, discussionsResponse, updatesResponse] = await Promise.all([
        fetch(`/api/lakes/${slug}`, { headers }),
        fetch(`/api/lakes/${slug}/businesses`, { headers }),
        fetch(`/api/lakes/${slug}/discussions`, { headers }),
        fetch(`/api/lakes/${slug}/updates`, { headers })
      ]);

      if (!lakeResponse.ok) {
        if (lakeResponse.status === 404) {
          this.showError('Lake not found');
          return;
        }
        throw new Error('Failed to load lake data');
      }

      const lakeData = await lakeResponse.json();
      if (!lakeData.success) {
        throw new Error(lakeData.message || 'Failed to load lake data');
      }

      this.lake = lakeData.lake;
      this.iceReports = lakeData.iceReports || [];
      this.catchReports = lakeData.catchReports || [];
      this.snowReports = lakeData.snowReports || [];

      // Load businesses
      if (businessesResponse.ok) {
        const businessesData = await businessesResponse.json();
        if (businessesData.success) {
          this.businesses = businessesData.businesses || [];
        }
      }

      // Load discussions
      if (discussionsResponse.ok) {
        const discussionsData = await discussionsResponse.json();
        if (discussionsData.success) {
          this.discussions = discussionsData.threads || [];
        }
      }

      // Load lake updates
      if (updatesResponse.ok) {
        const updatesData = await updatesResponse.json();
        if (updatesData.success) {
          this.lakeUpdates = updatesData.updates || [];
        }
      }

      // Render all sections (weather loads async after initial render)
      this.render();

      // Load weather data asynchronously (don't block page load)
      this.loadWeather();

    } catch (error) {
      console.error('[LakeDetail] Error loading lake:', error);
      this.showError('Failed to load lake data. Please try again.');
    }
  },

  /**
   * Load weather data from weather API proxy
   */
  async loadWeather() {
    try {
      const { latitude, longitude } = this.lake;

      // Load current weather and forecast in parallel
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`${this.WEATHER_API_URL}/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial`),
        fetch(`${this.WEATHER_API_URL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial`)
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error('Weather API request failed');
      }

      const currentWeather = await currentRes.json();
      const forecastData = await forecastRes.json();

      // Transform the data
      this.weather = {
        temp: Math.round(currentWeather.main.temp),
        feelsLike: Math.round(currentWeather.main.feels_like),
        wind: {
          speed: Math.round(currentWeather.wind.speed),
          direction: this.getWindDirection(currentWeather.wind.deg)
        },
        conditions: currentWeather.weather[0]?.description || 'Unknown',
        icon: currentWeather.weather[0]?.icon || '01d',
        forecast: this.processForecast(forecastData)
      };

      this.renderWeather();

    } catch (error) {
      console.error('[LakeDetail] Error loading weather:', error);
      this.renderWeatherError();
    }
  },

  /**
   * Process 5-day forecast into daily summaries
   */
  processForecast(forecastData) {
    if (!forecastData.list || forecastData.list.length === 0) return [];

    // Group by day
    const dailyData = {};
    const today = new Date().toDateString();

    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();

      // Skip today
      if (dayKey === today) return;

      if (!dailyData[dayKey]) {
        dailyData[dayKey] = {
          date: date,
          temps: [],
          icons: []
        };
      }

      dailyData[dayKey].temps.push(item.main.temp);
      dailyData[dayKey].icons.push(item.weather[0]?.icon);
    });

    // Convert to array and take first 3 days
    const days = Object.values(dailyData).slice(0, 3);

    return days.map(day => {
      const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
      const high = Math.round(Math.max(...day.temps));
      const low = Math.round(Math.min(...day.temps));
      // Get most common icon (simple mode selection)
      const iconCounts = {};
      day.icons.forEach(icon => {
        iconCounts[icon] = (iconCounts[icon] || 0) + 1;
      });
      const mostCommonIcon = Object.keys(iconCounts).reduce((a, b) =>
        iconCounts[a] > iconCounts[b] ? a : b
      );

      return {
        day: dayName,
        high,
        low,
        icon: this.WEATHER_CODE_MAP[mostCommonIcon] || 'cloudy'
      };
    });
  },

  /**
   * Convert wind degrees to cardinal direction
   */
  getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  },

  /**
   * Render the full page
   */
  render() {
    // Update page title
    document.title = `FisherMN - ${this.lake.name}`;

    // Render each section
    this.renderHeader();
    this.renderStats();
    this.renderPOIs();
    this.renderRecentReports();
    this.renderWeatherLoading(); // Show loading state until weather loads
    this.renderActivity();
    this.renderDiscussions();
    this.renderAbout();
    this.initMap();
    this.updateFavoriteButton();
  },

  /**
   * Render lake header
   */
  renderHeader() {
    const lake = this.lake;
    const ice = lake.officialIce;

    // Lake name
    document.getElementById('lake-name').textContent = lake.name;
    document.getElementById('lake-region').textContent = lake.region || 'Minnesota';
    document.getElementById('map-lake-name').textContent = lake.name;
    document.getElementById('map-lake-region').textContent = lake.region || 'Minnesota';

    // Ice statistics
    const iceStats = lake.iceStats || { average: null, max: null, min: null, reportCount: 0 };

    // Average thickness (7 days)
    const avgEl = document.getElementById('stat-avg-thickness');
    if (avgEl) {
      avgEl.textContent = iceStats.average ? `${iceStats.average}"` : '--';
    }

    // Max thickness (3 days)
    const maxEl = document.getElementById('stat-max-thickness');
    if (maxEl) {
      maxEl.textContent = iceStats.max ? `${iceStats.max}"` : '--';
    }

    // Min thickness (3 days)
    const minEl = document.getElementById('stat-min-thickness');
    if (minEl) {
      minEl.textContent = iceStats.min ? `${iceStats.min}"` : '--';
    }

    // Stats note
    const noteEl = document.getElementById('ice-stats-note');
    if (noteEl) {
      if (iceStats.reportCount > 0) {
        noteEl.textContent = `Based on ${iceStats.reportCount} report${iceStats.reportCount !== 1 ? 's' : ''} in the last 7 days`;
      } else {
        noteEl.textContent = 'No recent ice reports available';
      }
    }
  },

  /**
   * Render stats cards
   */
  renderStats() {
    const counts = this.lake.reportCounts;
    document.getElementById('stat-ice-reports').textContent = counts.iceCount;
    document.getElementById('stat-catch-reports').textContent = counts.catchCount;

    // Calculate last report time
    let lastReportText = '--';
    const allReports = [...this.iceReports, ...this.catchReports];
    if (allReports.length > 0) {
      const dates = allReports.map(r => new Date(r.reportedAt || r.caughtAt));
      const mostRecent = new Date(Math.max(...dates));
      lastReportText = this.formatDate(mostRecent.toISOString());
    }
    document.getElementById('stat-last-report').textContent = lastReportText;
  },

  /**
   * Render POI grid
   */
  renderPOIs() {
    const container = document.getElementById('poi-grid');
    if (!container) return;

    if (this.businesses.length === 0) {
      container.innerHTML = '<p class="text-secondary text-sm col-span-2">No nearby businesses listed yet.</p>';
      return;
    }

    // Group by type
    const grouped = {};
    this.businesses.forEach(biz => {
      if (!grouped[biz.type]) grouped[biz.type] = [];
      grouped[biz.type].push(biz);
    });

    const typeOrder = ['BAIT', 'BAR', 'RESORT', 'CASINO', 'OTHER'];
    let html = '';

    typeOrder.forEach(type => {
      if (grouped[type]) {
        const typeInfo = this.POI_TYPES[type] || this.POI_TYPES.OTHER;
        html += `
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm font-semibold">
              <span class="text-lg">${typeInfo.icon}</span>
              <span>${typeInfo.label}s</span>
              <span class="text-xs text-secondary font-normal">(${grouped[type].length})</span>
            </div>
            <div class="space-y-1">
        `;

        grouped[type].forEach((biz, index) => {
          const poiId = `${type}-${index}`;
          html += `
            <div class="poi-item p-2 rounded-lg border border-grayPanel bg-frost/50 hover:bg-frost"
                 data-poi-id="${poiId}"
                 onclick="LakeDetail.focusPOI('${poiId}', ${biz.latitude}, ${biz.longitude})">
              <p class="font-medium text-sm">${biz.name}</p>
              ${biz.address ? `<p class="text-xs text-secondary">${biz.address}</p>` : ''}
              ${this.renderBusinessTags(biz)}
            </div>
          `;
        });

        html += '</div></div>';
      }
    });

    container.innerHTML = html;
  },

  /**
   * Render business tags (amenities)
   */
  renderBusinessTags(biz) {
    const tags = [];
    if (biz.hasPullTabs) tags.push('Pull Tabs');
    if (biz.hasLiveBait) tags.push('Live Bait');
    if (biz.hasFood) tags.push('Food');
    if (biz.hasLodging) tags.push('Lodging');
    if (biz.hasTackle) tags.push('Tackle');
    if (biz.hasIceHouseRental) tags.push('Ice House Rental');

    if (tags.length === 0) return '';

    return `<div class="flex flex-wrap gap-1 mt-1">
      ${tags.map(tag => `<span class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">${tag}</span>`).join('')}
    </div>`;
  },

  /**
   * Focus on a POI on the map
   */
  focusPOI(poiId, lat, lon) {
    // Remove active class from all POI items
    document.querySelectorAll('.poi-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to clicked item
    const clickedItem = document.querySelector(`[data-poi-id="${poiId}"]`);
    if (clickedItem) {
      clickedItem.classList.add('active');
    }

    // Pan to POI and open popup
    if (this.map) {
      this.map.flyTo([lat, lon], 14, { duration: 0.8 });

      if (this.markers[poiId]) {
        setTimeout(() => {
          this.markers[poiId].openPopup();
        }, 900);
      }
    }
  },

  /**
   * Render recent reports (Ice, Catch, Snow combined)
   */
  renderRecentReports() {
    const container = document.getElementById('reports-list');
    if (!container) return;

    // Combine all reports with type metadata
    const allReports = [
      ...this.iceReports.map(r => ({ ...r, type: 'ice', timestamp: r.reportedAt })),
      ...this.catchReports.map(r => ({ ...r, type: 'catch', timestamp: r.caughtAt })),
      ...this.snowReports.map(r => ({ ...r, type: 'snow', timestamp: r.reportedAt }))
    ];

    // Sort by timestamp descending (most recent first)
    allReports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Render empty state if no reports
    if (allReports.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-secondary">
          <p>No reports yet. Be the first to share conditions!</p>
        </div>
      `;
      return;
    }

    // Render reports
    container.innerHTML = allReports.map(report => {
      if (report.type === 'ice') {
        return this.renderIceReportCard(report);
      } else if (report.type === 'catch') {
        return this.renderCatchReportCard(report);
      } else if (report.type === 'snow') {
        return this.renderSnowReportCard(report);
      }
    }).join('');
  },

  /**
   * Render individual ice report card
   */
  renderIceReportCard(report) {
    const thicknessClass = this.getThicknessClass(report.thicknessInches);
    return `
      <div class="bg-frost rounded-lg p-3">
        <div class="flex items-start gap-3">
          <!-- Left: Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-lg">❄️</span>
              <span class="badge bg-primary text-white text-xs">ICE</span>
              <span class="badge ${thicknessClass} text-white text-xs">${report.thicknessInches}"</span>
              ${report.condition ? `<span class="text-xs text-secondary capitalize">${report.condition}</span>` : ''}
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs font-medium">${report.user.displayName}</span>
              <span class="badge bg-secondary text-white text-xs">${report.user.rankTier}</span>
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs text-secondary">${this.formatDate(report.reportedAt)}</span>
            </div>

            <!-- Location notes -->
            ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}

            <!-- Comments button -->
            <button
              class="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1"
              onclick="LakeDetail.toggleComments('ice', '${report.id}')"
            >
              <span>💬</span>
              <span class="comment-count-text">${report.commentCount || 0} comment${report.commentCount !== 1 ? 's' : ''}</span>
            </button>
          </div>

          <!-- Right: Vote buttons -->
          <div class="flex-shrink-0">
            ${this.renderVoteButtons(report, 'ice')}
          </div>
        </div>

        <!-- Comment section (collapsible) -->
        <div class="comment-container hidden mt-3 pl-7" data-content-type="ice" data-content-id="${report.id}">
        </div>
      </div>
    `;
  },

  /**
   * Render individual catch report card
   */
  renderCatchReportCard(report) {
    const details = this.renderCatchDetails(report);
    return `
      <div class="bg-frost rounded-lg p-3">
        <div class="flex items-start gap-3">
          <!-- Left: Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-lg">🐟</span>
              <span class="badge bg-evergreen text-white text-xs">CATCH</span>
              <span class="font-bold text-sm">${report.fishSpecies}</span>
              ${report.fishCount > 1 ? `<span class="text-xs text-secondary">(${report.fishCount})</span>` : ''}
              ${details ? `<span class="text-xs text-secondary">•</span>${details}` : ''}
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs font-medium">${report.user.displayName}</span>
              <span class="badge bg-secondary text-white text-xs">${report.user.rankTier}</span>
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs text-secondary">${this.formatDate(report.caughtAt)}</span>
            </div>

            <!-- Location notes -->
            ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}

            <!-- Comments button -->
            <button
              class="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1"
              onclick="LakeDetail.toggleComments('catch', '${report.id}')"
            >
              <span>💬</span>
              <span class="comment-count-text">${report.commentCount || 0} comment${report.commentCount !== 1 ? 's' : ''}</span>
            </button>
          </div>

          <!-- Right: Vote buttons -->
          <div class="flex-shrink-0">
            ${this.renderVoteButtons(report, 'catch')}
          </div>
        </div>

        <!-- Comment section (collapsible) -->
        <div class="comment-container hidden mt-3 pl-7" data-content-type="catch" data-content-id="${report.id}">
        </div>
      </div>
    `;
  },

  /**
   * Render individual snow report card
   */
  renderSnowReportCard(report) {
    return `
      <div class="bg-frost rounded-lg p-3">
        <div class="flex items-start gap-3">
          <!-- Left: Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-lg">❅</span>
              <span class="badge bg-ice text-white text-xs">SNOW</span>
              <span class="badge bg-primary text-white text-xs">${report.thicknessInches}"</span>
              <span class="text-xs text-secondary capitalize">${report.snowType}</span>
              <span class="text-xs text-secondary capitalize">${report.coverage}</span>
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs font-medium">${report.user.displayName}</span>
              <span class="badge bg-secondary text-white text-xs">${report.user.rankTier}</span>
              <span class="text-xs text-secondary">•</span>
              <span class="text-xs text-secondary">${this.formatDate(report.reportedAt)}</span>
            </div>

            <!-- Location notes -->
            ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}

            <!-- Comments button -->
            <button
              class="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1"
              onclick="LakeDetail.toggleComments('snow', '${report.id}')"
            >
              <span>💬</span>
              <span class="comment-count-text">${report.commentCount || 0} comment${report.commentCount !== 1 ? 's' : ''}</span>
            </button>
          </div>

          <!-- Right: Vote buttons -->
          <div class="flex-shrink-0">
            ${this.renderVoteButtons(report, 'snow')}
          </div>
        </div>

        <!-- Comment section (collapsible) -->
        <div class="comment-container hidden mt-3 pl-7" data-content-type="snow" data-content-id="${report.id}">
        </div>
      </div>
    `;
  },

  /**
   * Helper: Extract catch report details
   */
  renderCatchDetails(report) {
    const details = [];
    if (report.largestSizeInches) details.push(`${report.largestSizeInches}"`);
    if (report.largestWeightLbs) details.push(`${report.largestWeightLbs} lbs`);
    if (report.depthFeet) details.push(`${report.depthFeet}ft`);
    if (report.baitUsed) details.push(`${report.baitUsed}`);

    return details.length > 0
      ? `<span class="text-xs text-secondary">${details.join(' • ')}</span>`
      : '';
  },

  /**
   * Render weather loading state
   */
  renderWeatherLoading() {
    document.getElementById('weather-temp').textContent = '--°F';
    document.getElementById('weather-feels').textContent = '--°F';
    document.getElementById('weather-conditions').textContent = 'Loading weather...';

    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer) {
      forecastContainer.innerHTML = '<p class="text-xs text-secondary">Loading forecast...</p>';
    }
  },

  /**
   * Render weather widget with real data
   */
  renderWeather() {
    if (!this.weather) {
      this.renderWeatherError();
      return;
    }

    const weather = this.weather;

    document.getElementById('weather-temp').textContent = `${weather.temp}°F`;
    document.getElementById('weather-feels').textContent = `${weather.feelsLike}°F`;

    // Capitalize first letter of conditions
    const conditions = weather.conditions.charAt(0).toUpperCase() + weather.conditions.slice(1);
    document.getElementById('weather-conditions').textContent = `${weather.wind.direction} ${weather.wind.speed} mph • ${conditions}`;

    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer && weather.forecast && weather.forecast.length > 0) {
      forecastContainer.innerHTML = weather.forecast.map(day => `
        <div class="weather-forecast-day text-center">
          <p class="text-xs text-muted mb-1">${day.day}</p>
          <p class="text-xl mb-1">${this.WEATHER_ICONS[day.icon] || '🌤️'}</p>
          <p class="text-xs font-medium">${day.high}° / ${day.low}°</p>
        </div>
      `).join('');
    } else if (forecastContainer) {
      forecastContainer.innerHTML = '<p class="text-xs text-secondary">Forecast unavailable</p>';
    }
  },

  /**
   * Render weather error state
   */
  renderWeatherError() {
    document.getElementById('weather-temp').textContent = '--°F';
    document.getElementById('weather-feels').textContent = '--°F';
    document.getElementById('weather-conditions').textContent = 'Weather unavailable';

    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer) {
      forecastContainer.innerHTML = '<p class="text-xs text-secondary">Unable to load forecast</p>';
    }
  },

  /**
   * Render activity feed (builds from reports and updates)
   */
  renderActivity() {
    const container = document.getElementById('activity-feed');
    if (!container) return;

    // Build activity from all sources with full report data
    const activity = [];

    this.iceReports.forEach(report => {
      activity.push({
        type: 'ice',
        data: report,
        rawTimestamp: new Date(report.reportedAt)
      });
    });

    this.catchReports.forEach(report => {
      activity.push({
        type: 'catch',
        data: report,
        rawTimestamp: new Date(report.caughtAt)
      });
    });

    this.snowReports.forEach(report => {
      activity.push({
        type: 'snow',
        data: report,
        rawTimestamp: new Date(report.reportedAt)
      });
    });

    this.lakeUpdates.forEach(update => {
      activity.push({
        type: 'general',
        data: update,
        rawTimestamp: new Date(update.createdAt)
      });
    });

    // Sort by timestamp (most recent first)
    activity.sort((a, b) => b.rawTimestamp - a.rawTimestamp);

    // Apply filter
    const filtered = this.currentActivityFilter === 'all'
      ? activity
      : activity.filter(item => item.type === this.currentActivityFilter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="card text-center text-secondary py-8">
          <p>No ${this.currentActivityFilter === 'all' ? '' : this.currentActivityFilter + ' '}activity for this lake.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      // Render full cards based on type
      if (item.type === 'ice') {
        return this.renderIceReportCard(item.data);
      } else if (item.type === 'catch') {
        return this.renderCatchReportCard(item.data);
      } else if (item.type === 'snow') {
        return this.renderSnowReportCard(item.data);
      } else if (item.type === 'general') {
        // Render general update card with votes/comments
        const update = item.data;
        return `
          <div class="bg-frost rounded-lg p-3">
            <div class="flex items-start gap-3">
              <!-- Left: Content -->
              <div class="flex-1 min-w-0">
                <!-- Header -->
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-lg">💬</span>
                  <span class="badge bg-gold text-white text-xs">UPDATE</span>
                  <span class="text-xs font-medium">${update.user.displayName}</span>
                  <span class="badge bg-secondary text-white text-xs">${update.user.rankTier}</span>
                  <span class="text-xs text-secondary">•</span>
                  <span class="text-xs text-secondary">${this.formatDate(update.createdAt)}</span>
                </div>

                <!-- Content -->
                <p class="text-sm mb-2">${update.content}</p>

                <!-- Comments button -->
                <button
                  class="text-xs text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  onclick="LakeDetail.toggleComments('update', '${update.id}')"
                >
                  <span>💬</span>
                  <span class="comment-count-text">${update.commentCount || 0} comment${update.commentCount !== 1 ? 's' : ''}</span>
                </button>
              </div>

              <!-- Right: Vote buttons -->
              <div class="flex-shrink-0">
                ${this.renderVoteButtons(update, 'update')}
              </div>
            </div>

            <!-- Comment section (collapsible) -->
            <div class="comment-container hidden mt-3 pl-7" data-content-type="update" data-content-id="${update.id}">
            </div>
          </div>
        `;
      }
    }).join('');
  },

  /**
   * Render discussions from API
   */
  renderDiscussions() {
    const threadList = document.getElementById('thread-list');
    const threadCount = document.getElementById('thread-count');

    if (this.discussions.length === 0) {
      threadList.innerHTML = `
        <div class="p-4 text-center text-secondary">
          <p class="mb-3">No discussions yet.</p>
          <p class="text-xs">Start a conversation about this lake!</p>
        </div>
      `;
      threadCount.textContent = '0 threads';

      // Reset thread content area
      document.getElementById('thread-title').textContent = 'No discussions';
      document.getElementById('thread-meta').textContent = 'Be the first to start a discussion about this lake';
      document.getElementById('thread-content').innerHTML = `
        <div class="text-center text-secondary py-8">
          <svg class="w-12 h-12 mx-auto mb-3 text-grayPanel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p>No discussions to display</p>
        </div>
      `;
      document.getElementById('reply-input').classList.add('hidden');
      return;
    }

    threadCount.textContent = `${this.discussions.length} thread${this.discussions.length !== 1 ? 's' : ''}`;

    threadList.innerHTML = this.discussions.map((thread, index) => {
      const pinnedIcon = thread.isPinned ? '<span class="text-gold">📌</span> ' : '';
      const lastReply = thread.lastReplyAt ? this.formatDate(thread.lastReplyAt) : this.formatDate(thread.createdAt);
      return `
        <div class="thread-item p-4 border-b border-grayPanel ${index === 0 ? 'active' : ''}"
             data-thread-id="${thread.id}"
             onclick="LakeDetail.selectThread('${thread.id}')">
          <h4 class="font-semibold text-sm mb-1 line-clamp-2">${pinnedIcon}${thread.title}</h4>
          <p class="text-xs text-secondary">
            Started by ${thread.author.displayName} • ${thread.replyCount} replies • Last: ${lastReply}
          </p>
        </div>
      `;
    }).join('');

    // Select first thread by default
    if (this.discussions.length > 0) {
      this.selectThread(this.discussions[0].id);
    }
  },

  /**
   * Select a discussion thread
   */
  selectThread(threadId) {
    const thread = this.discussions.find(t => t.id === threadId);
    if (!thread) return;

    this.currentThread = thread;

    // Update active state in thread list
    document.querySelectorAll('.thread-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.threadId === threadId) {
        item.classList.add('active');
      }
    });

    // Update thread header
    document.getElementById('thread-title').textContent = thread.title;
    document.getElementById('thread-meta').textContent = `Posted by ${thread.author.displayName} • ${this.formatDate(thread.createdAt)}`;

    // Populate thread content - start with the OP (thread body)
    const contentContainer = document.getElementById('thread-content');
    let html = '';

    // Original post (the thread body)
    const opInitials = thread.author.displayName.substring(0, 2).toUpperCase();
    html += `
      <div class="mb-4 p-4 rounded-lg bg-frost border border-grayPanel">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            ${opInitials}
          </div>
          <div class="flex-1">
            <div class="flex items-center mb-2">
              <span class="font-semibold text-sm">${thread.author.displayName}</span>
              <span class="text-xs bg-primary text-white px-2 py-0.5 rounded ml-2">OP</span>
              <span class="text-xs text-secondary ml-auto">${this.formatDate(thread.createdAt)}</span>
            </div>
            <p class="text-sm">${thread.body}</p>
          </div>
        </div>
      </div>
    `;

    // Replies
    if (thread.posts && thread.posts.length > 0) {
      thread.posts.forEach(post => {
        const initials = post.author.displayName.substring(0, 2).toUpperCase();

        html += `
          <div class="mb-4 p-4 rounded-lg bg-white border border-grayPanel">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                ${initials}
              </div>
              <div class="flex-1">
                <div class="flex items-center mb-2">
                  <span class="font-semibold text-sm">${post.author.displayName}</span>
                  <span class="text-xs text-secondary ml-auto">${this.formatDate(post.createdAt)}</span>
                </div>
                <p class="text-sm">${post.body}</p>
              </div>
            </div>
          </div>
        `;
      });
    }

    contentContainer.innerHTML = html;

    // Show reply input
    document.getElementById('reply-input').classList.remove('hidden');
  },

  /**
   * Render About tab
   */
  renderAbout() {
    const lake = this.lake;
    const amenities = lake.amenities;

    // Description
    const descEl = document.getElementById('lake-description');
    if (descEl) {
      descEl.textContent = lake.description || 'No description available for this lake.';
    }

    // Amenities list
    const amenitiesList = document.getElementById('amenities-list');
    if (amenitiesList) {
      const items = [];
      if (amenities.hasBaitShop) items.push({ icon: '🎣', text: 'Bait Shop Nearby' });
      if (amenities.barsCount > 0) items.push({ icon: '🍺', text: `${amenities.barsCount} Bar${amenities.barsCount > 1 ? 's' : ''} Nearby` });
      if (amenities.hasCasino) items.push({ icon: '🎰', text: 'Casino Nearby' });
      if (amenities.hasLodging) items.push({ icon: '🏨', text: 'Lodging Available' });
      if (amenities.hasRestaurant) items.push({ icon: '🍽️', text: 'Restaurant Nearby' });
      if (amenities.hasBoatLaunch) items.push({ icon: '🚤', text: 'Boat Launch' });
      if (amenities.hasIceHouseRental) items.push({ icon: '🏠', text: 'Ice House Rental' });
      if (amenities.hasGasStation) items.push({ icon: '⛽', text: 'Gas Station' });
      if (amenities.hasGrocery) items.push({ icon: '🛒', text: 'Grocery Store' });
      if (amenities.hasGuideService) items.push({ icon: '🧭', text: 'Guide Service' });

      if (items.length === 0) {
        amenitiesList.innerHTML = '<p class="text-secondary col-span-2">No amenities listed.</p>';
      } else {
        amenitiesList.innerHTML = items.map(item => `
          <div class="flex items-center gap-2 p-2 bg-frost rounded-lg">
            <span class="text-xl">${item.icon}</span>
            <span class="text-sm">${item.text}</span>
          </div>
        `).join('');
      }
    }
  },

  /**
   * Initialize the map with POI markers
   */
  initMap() {
    if (!this.lake || typeof L === 'undefined') return;

    const mapEl = document.getElementById('lake-map');
    if (!mapEl) return;

    // Create map
    this.map = L.map('lake-map').setView([this.lake.latitude, this.lake.longitude], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 8
    }).addTo(this.map);

    // Lake center marker
    const lakeIcon = L.divIcon({
      className: 'lake-marker',
      html: `<div style="background-color: #0A3A60; width: 32px; height: 32px; border-radius: 50%; border: 4px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 16px;">🎣</span>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([this.lake.latitude, this.lake.longitude], { icon: lakeIcon })
      .addTo(this.map)
      .bindPopup(`<strong>${this.lake.name}</strong><br>Lake Center`);

    // Add POI markers
    this.businesses.forEach((biz, index) => {
      const typeInfo = this.POI_TYPES[biz.type] || this.POI_TYPES.OTHER;
      const poiId = `${biz.type}-${index}`;

      const poiIcon = L.divIcon({
        className: 'poi-marker',
        html: `<div style="background-color: ${typeInfo.color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 14px;">${typeInfo.icon}</span>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([biz.latitude, biz.longitude], { icon: poiIcon })
        .addTo(this.map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <p style="font-size: 12px; color: ${typeInfo.color}; margin-bottom: 4px;">${typeInfo.icon} ${typeInfo.label}</p>
            <p style="font-weight: bold; margin-bottom: 4px;">${biz.name}</p>
            ${biz.address ? `<p style="font-size: 12px; color: #4B5563;">${biz.address}</p>` : ''}
          </div>
        `);

      this.markers[poiId] = marker;
    });
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite() {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    const token = localStorage.getItem('fishermn_auth_token');
    const method = this.lake.isFavorited ? 'DELETE' : 'POST';

    try {
      const response = await fetch(`/api/lakes/${this.lake.slug}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.lake.isFavorited = !this.lake.isFavorited;
        this.updateFavoriteButton();
      }
    } catch (error) {
      console.error('[LakeDetail] Error toggling favorite:', error);
    }
  },

  /**
   * Update favorite button state
   */
  updateFavoriteButton() {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;

    if (this.lake.isFavorited) {
      btn.classList.add('bg-gold', 'border-gold', 'text-white');
      btn.classList.remove('border-grayPanel', 'text-secondary', 'hover:border-gold', 'hover:text-gold');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      btn.title = 'Remove from favorites';
    } else {
      btn.classList.remove('bg-gold', 'border-gold', 'text-white');
      btn.classList.add('border-grayPanel', 'text-secondary', 'hover:border-gold', 'hover:text-gold');
      btn.querySelector('svg').setAttribute('fill', 'none');
      btn.title = 'Add to favorites';
    }
  },

  /**
   * Show add report form with current lake pre-selected
   */
  showAddReportForm() {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    if (typeof AddReportModal !== 'undefined') {
      // Pass current lake data to auto-select and skip step 1
      const lakeData = {
        id: this.lake.id,
        name: this.lake.name,
        slug: this.lake.slug
      };
      AddReportModal.open(null, lakeData);
    }
  },

  /**
   * Show error state
   */
  showError(message) {
    // Hide weather bar
    const weatherWidget = document.getElementById('weather-widget');
    if (weatherWidget) weatherWidget.style.display = 'none';

    // Show error in overview tab
    document.getElementById('tab-overview').innerHTML = `
      <div class="card text-center py-20">
        <svg class="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <h2 class="text-xl font-bold text-primary mb-2">Error</h2>
        <p class="text-secondary mb-6">${message}</p>
        <a href="/lakes.html" class="btn-primary inline-block">Browse All Lakes</a>
      </div>
    `;
  },

  /**
   * Get badge class for ice condition
   */
  getConditionBadgeClass(condition) {
    switch (condition) {
      case 'excellent': return 'bg-evergreen text-white';
      case 'good': return 'bg-gold text-white';
      case 'fair': return 'bg-gold text-white';
      case 'poor': return 'bg-orange-500 text-white';
      case 'dangerous': return 'bg-red-500 text-white';
      default: return 'bg-grayPanel text-secondary';
    }
  },

  /**
   * Get badge class for ice thickness
   */
  getThicknessClass(thickness) {
    if (!thickness || thickness < 6) return 'bg-danger';
    if (thickness < 12) return 'bg-gold';
    return 'bg-evergreen';
  },

  /**
   * Filter activity feed by type
   */
  filterActivity(type) {
    this.currentActivityFilter = type;

    // Update filter button styles
    document.querySelectorAll('.activity-filter-btn').forEach(btn => {
      if (btn.dataset.filter === type) {
        btn.classList.add('bg-primary/10', 'text-primary', 'font-medium');
        btn.classList.remove('hover:bg-frost');
      } else {
        btn.classList.remove('bg-primary/10', 'text-primary', 'font-medium');
        btn.classList.add('hover:bg-frost');
      }
    });

    // Re-render activity with new filter
    this.renderActivity();
  },

  /**
   * Post a general update about the lake
   */
  async postUpdate() {
    // Check authentication
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    const input = document.getElementById('update-input');
    const errorEl = document.getElementById('update-error');
    const btn = document.getElementById('post-update-btn');

    const content = input.value.trim();

    // Validate
    if (!content) {
      errorEl.textContent = 'Please enter a message';
      errorEl.classList.remove('hidden');
      return;
    }

    // Clear error
    errorEl.classList.add('hidden');

    // Disable button
    btn.disabled = true;
    btn.textContent = 'Posting...';

    try {
      const token = localStorage.getItem('fishermn_auth_token');
      const response = await fetch(`/api/lakes/${this.lake.slug}/updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        // Clear input
        input.value = '';

        // Reload lake updates
        const updatesResponse = await fetch(`/api/lakes/${this.lake.slug}/updates`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (updatesResponse.ok) {
          const data = await updatesResponse.json();
          if (data.success) {
            this.lakeUpdates = data.updates || [];
            this.renderActivity();
          }
        }
      } else {
        const error = await response.json();
        errorEl.textContent = error.message || 'Failed to post update';
        errorEl.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error posting update:', error);
      errorEl.textContent = 'Network error. Please try again.';
      errorEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Post';
    }
  },

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  // ==================== VOTING METHODS ====================

  /**
   * Render vote buttons with current counts (vertical compact style)
   * @param {Object} item - Content item (report or update)
   * @param {string} contentType - 'ice', 'catch', 'snow', 'update'
   * @returns {string} HTML for vote buttons
   */
  renderVoteButtons(item, contentType) {
    const isAuthenticated = typeof Auth !== 'undefined' && Auth.isAuthenticated();

    if (!isAuthenticated) {
      // Show counts only (no interactive buttons)
      return `
        <div class="flex flex-col items-center gap-1">
          <div class="text-xs text-secondary flex items-center gap-1">
            <span>↑</span><span>${item.upvotes || 0}</span>
          </div>
          <div class="text-xs text-secondary flex items-center gap-1">
            <span>↓</span><span>${item.downvotes || 0}</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="flex flex-col items-center gap-1">
        <button
          class="vote-btn flex items-center justify-center gap-1 px-2 py-1 rounded text-xs hover:bg-evergreen/10 hover:text-evergreen transition-colors text-secondary"
          data-content-type="${contentType}"
          data-content-id="${item.id}"
          data-vote-type="up"
          onclick="LakeDetail.handleVote('${contentType}', '${item.id}', 'up')"
          title="Upvote"
        >
          <span>↑</span><span class="vote-count-up font-medium">${item.upvotes || 0}</span>
        </button>
        <button
          class="vote-btn flex items-center justify-center gap-1 px-2 py-1 rounded text-xs hover:bg-danger/10 hover:text-danger transition-colors text-secondary"
          data-content-type="${contentType}"
          data-content-id="${item.id}"
          data-vote-type="down"
          onclick="LakeDetail.handleVote('${contentType}', '${item.id}', 'down')"
          title="Downvote"
        >
          <span>↓</span><span class="vote-count-down font-medium">${item.downvotes || 0}</span>
        </button>
      </div>
    `;
  },

  /**
   * Handle vote button click
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} voteType - 'up' or 'down'
   */
  async handleVote(contentType, contentId, voteType) {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    try {
      const token = localStorage.getItem('fishermn_auth_token');
      const response = await fetch(`/api/votes/${contentType}/${contentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) {
        throw new Error('Vote request failed');
      }

      const data = await response.json();

      // Optimistic UI update
      this.updateVoteUI(contentType, contentId, data.action, voteType);

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to record vote. Please try again.');
    }
  },

  /**
   * Update vote UI after vote action
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} action - 'created', 'changed', 'removed'
   * @param {string} voteType - 'up' or 'down'
   */
  updateVoteUI(contentType, contentId, action, voteType) {
    // Find vote buttons for this content
    const upBtn = document.querySelector(`[data-content-id="${contentId}"][data-vote-type="up"]`);
    const downBtn = document.querySelector(`[data-content-id="${contentId}"][data-vote-type="down"]`);

    if (!upBtn || !downBtn) return;

    const upCount = upBtn.querySelector('.vote-count-up');
    const downCount = downBtn.querySelector('.vote-count-down');

    if (action === 'created') {
      // New vote - increment count
      if (voteType === 'up') {
        upCount.textContent = parseInt(upCount.textContent) + 1;
      } else {
        downCount.textContent = parseInt(downCount.textContent) + 1;
      }
    } else if (action === 'removed') {
      // Removed vote - decrement count
      if (voteType === 'up') {
        upCount.textContent = Math.max(0, parseInt(upCount.textContent) - 1);
      } else {
        downCount.textContent = Math.max(0, parseInt(downCount.textContent) - 1);
      }
    } else if (action === 'changed') {
      // Changed vote - decrement old, increment new
      if (voteType === 'up') {
        downCount.textContent = Math.max(0, parseInt(downCount.textContent) - 1);
        upCount.textContent = parseInt(upCount.textContent) + 1;
      } else {
        upCount.textContent = Math.max(0, parseInt(upCount.textContent) - 1);
        downCount.textContent = parseInt(downCount.textContent) + 1;
      }
    }
  },

  // ==================== COMMENT METHODS ====================

  /**
   * Render comment section content (without toggle button)
   * @param {string} contentType - 'ice', 'catch', 'snow', 'update'
   * @param {string} contentId - Content item ID
   * @returns {string} HTML for comment section content
   */
  renderCommentSectionContent(contentType, contentId) {
    const isAuthenticated = typeof Auth !== 'undefined' && Auth.isAuthenticated();

    return `
      <!-- Sort Toggle -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex gap-2 text-xs">
          <button
            class="sort-btn active px-2 py-1 rounded bg-primary/10 text-primary font-medium transition-colors"
            data-sort="newest"
            onclick="LakeDetail.changeCommentSort('${contentType}', '${contentId}', 'newest')"
          >
            Newest
          </button>
          <button
            class="sort-btn px-2 py-1 rounded hover:bg-frost transition-colors"
            data-sort="liked"
            onclick="LakeDetail.changeCommentSort('${contentType}', '${contentId}', 'liked')"
          >
            Most Liked
          </button>
        </div>
      </div>

      <!-- Comments List (scrollable) -->
      <div class="comments-list space-y-2 max-h-64 overflow-y-auto pr-2">
        <p class="text-xs text-secondary">Loading comments...</p>
      </div>

      ${isAuthenticated ? `
        <!-- Comment Input -->
        <div class="comment-input-section mt-3 pt-2 border-t border-grayPanel">
          <textarea
            class="comment-input w-full p-2 text-sm border border-grayPanel rounded-lg resize-none focus:outline-none focus:border-primary"
            placeholder="Add a comment... (144 characters max)"
            maxlength="144"
            rows="2"
            data-content-type="${contentType}"
            data-content-id="${contentId}"
            oninput="LakeDetail.updateCharCount(this)"
          ></textarea>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-secondary char-count">0/144</span>
            <button
              class="btn-sm btn-primary"
              onclick="LakeDetail.postComment('${contentType}', '${contentId}')"
            >
              Post
            </button>
          </div>
        </div>
      ` : ''}
    `;
  },

  /**
   * Toggle comment section visibility
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   */
  async toggleComments(contentType, contentId) {
    const container = document.querySelector(
      `.comment-container[data-content-type="${contentType}"][data-content-id="${contentId}"]`
    );

    if (!container) return;

    const isHidden = container.classList.contains('hidden');

    if (isHidden) {
      // Expand - load comments
      container.classList.remove('hidden');

      // Render comment section UI if first time
      if (!container.dataset.loaded) {
        container.innerHTML = this.renderCommentSectionContent(contentType, contentId);
        await this.loadComments(contentType, contentId, 'newest');
        container.dataset.loaded = 'true';
      }
    } else {
      // Collapse
      container.classList.add('hidden');
    }
  },

  /**
   * Load comments for content
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} sortBy - 'newest' or 'liked'
   * @param {number} offset - Offset for pagination
   */
  async loadComments(contentType, contentId, sortBy = 'newest', offset = 0) {
    const container = document.querySelector(
      `.comment-container[data-content-type="${contentType}"][data-content-id="${contentId}"]`
    );

    if (!container) return;

    const commentsList = container.querySelector('.comments-list');

    try {
      const response = await fetch(
        `/api/comments/${contentType}/${contentId}?sortBy=${sortBy}&limit=10&offset=${offset}`
      );

      if (!response.ok) throw new Error('Failed to load comments');

      const data = await response.json();

      if (data.comments.length === 0 && offset === 0) {
        commentsList.innerHTML = '<p class="text-xs text-secondary">No comments yet. Be the first!</p>';
        return;
      }

      // Render comments
      const commentsHTML = data.comments.map(comment => this.renderComment(comment)).join('');

      if (offset === 0) {
        commentsList.innerHTML = commentsHTML;
      } else {
        const loadMoreBtn = commentsList.querySelector('.load-more-btn');
        if (loadMoreBtn) loadMoreBtn.remove();
        commentsList.innerHTML += commentsHTML;
      }

      // Add "Load More" button if there are more comments
      if (data.hasMore) {
        const loadMoreBtn = `
          <button
            class="load-more-btn w-full text-xs text-primary hover:underline py-2"
            onclick="LakeDetail.loadComments('${contentType}', '${contentId}', '${sortBy}', ${offset + 10})"
          >
            View ${data.totalCount - (offset + data.count)} more comment${data.totalCount - (offset + data.count) !== 1 ? 's' : ''}
          </button>
        `;
        commentsList.innerHTML += loadMoreBtn;
      }

    } catch (error) {
      console.error('Error loading comments:', error);
      commentsList.innerHTML = '<p class="text-xs text-danger">Failed to load comments</p>';
    }
  },

  /**
   * Render individual comment
   * @param {Object} comment - Comment object
   * @returns {string} HTML for comment
   */
  renderComment(comment) {
    const initials = comment.user.displayName.substring(0, 2).toUpperCase();

    return `
      <div class="comment bg-frost/50 rounded-lg p-2">
        <div class="flex items-start gap-2">
          <div class="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-white text-xs flex-shrink-0">
            ${initials}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold">${comment.user.displayName}</span>
              <span class="text-xs text-secondary">${this.formatDate(comment.createdAt)}</span>
            </div>
            <p class="text-sm mb-2">${comment.body}</p>
            <div class="flex items-center gap-3">
              ${this.renderCommentVoteButtons(comment)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render vote buttons for comments
   * @param {Object} comment - Comment object
   * @returns {string} HTML for comment vote buttons
   */
  renderCommentVoteButtons(comment) {
    const isAuthenticated = typeof Auth !== 'undefined' && Auth.isAuthenticated();

    if (!isAuthenticated) {
      return `
        <div class="flex items-center gap-2 text-xs text-secondary">
          <span>↑ ${comment.upvotes || 0}</span>
          <span>↓ ${comment.downvotes || 0}</span>
        </div>
      `;
    }

    return `
      <div class="flex items-center gap-2 text-xs">
        <button
          class="comment-vote-btn flex items-center gap-1 hover:text-evergreen transition-colors text-secondary"
          onclick="LakeDetail.voteOnComment('${comment.id}', 'up')"
        >
          ↑ <span class="comment-vote-up-${comment.id}">${comment.upvotes || 0}</span>
        </button>
        <button
          class="comment-vote-btn flex items-center gap-1 hover:text-danger transition-colors text-secondary"
          onclick="LakeDetail.voteOnComment('${comment.id}', 'down')"
        >
          ↓ <span class="comment-vote-down-${comment.id}">${comment.downvotes || 0}</span>
        </button>
      </div>
    `;
  },

  /**
   * Post a new comment
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   */
  async postComment(contentType, contentId) {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    const textarea = document.querySelector(
      `textarea[data-content-type="${contentType}"][data-content-id="${contentId}"]`
    );

    if (!textarea) return;

    const body = textarea.value.trim();

    if (!body) {
      alert('Please enter a comment');
      return;
    }

    if (body.length > 144) {
      alert('Comment must be 144 characters or less');
      return;
    }

    try {
      const token = localStorage.getItem('fishermn_auth_token');
      const response = await fetch(`/api/comments/${contentType}/${contentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body })
      });

      if (!response.ok) throw new Error('Failed to post comment');

      // Clear textarea
      textarea.value = '';
      this.updateCharCount(textarea);

      // Reload comments
      const container = document.querySelector(
        `.comment-container[data-content-type="${contentType}"][data-content-id="${contentId}"]`
      );
      const sortBtn = container?.querySelector('.sort-btn.active');
      const sortBy = sortBtn?.dataset.sort || 'newest';
      await this.loadComments(contentType, contentId, sortBy);

      // Update comment count - find within the parent card
      const card = container?.closest('.bg-frost');
      if (card) {
        const countSpan = card.querySelector('.comment-count-text');
        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent);
          countSpan.textContent = `${currentCount + 1} comment${currentCount + 1 !== 1 ? 's' : ''}`;
        }
      }

    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please try again.');
    }
  },

  /**
   * Vote on a comment
   * @param {string} commentId - Comment ID
   * @param {string} voteType - 'up' or 'down'
   */
  async voteOnComment(commentId, voteType) {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    try {
      const token = localStorage.getItem('fishermn_auth_token');
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ voteType })
      });

      if (!response.ok) throw new Error('Failed to vote on comment');

      const data = await response.json();

      // Update UI
      const upSpan = document.querySelector(`.comment-vote-up-${commentId}`);
      const downSpan = document.querySelector(`.comment-vote-down-${commentId}`);

      if (upSpan && downSpan) {
        if (data.action === 'created') {
          if (voteType === 'up') {
            upSpan.textContent = parseInt(upSpan.textContent) + 1;
          } else {
            downSpan.textContent = parseInt(downSpan.textContent) + 1;
          }
        } else if (data.action === 'removed') {
          if (voteType === 'up') {
            upSpan.textContent = Math.max(0, parseInt(upSpan.textContent) - 1);
          } else {
            downSpan.textContent = Math.max(0, parseInt(downSpan.textContent) - 1);
          }
        } else if (data.action === 'changed') {
          if (voteType === 'up') {
            downSpan.textContent = Math.max(0, parseInt(downSpan.textContent) - 1);
            upSpan.textContent = parseInt(upSpan.textContent) + 1;
          } else {
            upSpan.textContent = Math.max(0, parseInt(upSpan.textContent) - 1);
            downSpan.textContent = parseInt(downSpan.textContent) + 1;
          }
        }
      }

    } catch (error) {
      console.error('Error voting on comment:', error);
      alert('Failed to record vote. Please try again.');
    }
  },

  /**
   * Update character count display
   * @param {HTMLTextAreaElement} textarea - Textarea element
   */
  updateCharCount(textarea) {
    const charCount = textarea.closest('.comment-input-section')?.querySelector('.char-count');
    if (charCount) {
      charCount.textContent = `${textarea.value.length}/144`;
    }
  },

  /**
   * Change comment sort order
   * @param {string} contentType - Content type
   * @param {string} contentId - Content ID
   * @param {string} sortBy - 'newest' or 'liked'
   */
  async changeCommentSort(contentType, contentId, sortBy) {
    const container = document.querySelector(
      `.comment-container[data-content-type="${contentType}"][data-content-id="${contentId}"]`
    );

    if (!container) return;

    // Update sort button states
    container.querySelectorAll('.sort-btn').forEach(btn => {
      if (btn.dataset.sort === sortBy) {
        btn.classList.add('active', 'bg-primary/10', 'text-primary', 'font-medium');
      } else {
        btn.classList.remove('active', 'bg-primary/10', 'text-primary', 'font-medium');
      }
    });

    // Reload comments with new sort
    await this.loadComments(contentType, contentId, sortBy);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  LakeDetail.init();
});

// Export for use in other modules
window.LakeDetail = LakeDetail;
