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
  businesses: [],
  discussions: [],
  weather: null,
  map: null,
  markers: {},
  currentThread: null,

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

    // Initialize tabs
    this.initTabs();

    // Initialize button handlers
    this.initButtons();

    // Load all data
    await this.loadLakeData(slug);
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

      // Load lake data, businesses, and discussions in parallel
      const [lakeResponse, businessesResponse, discussionsResponse] = await Promise.all([
        fetch(`/api/lakes/${slug}`, { headers }),
        fetch(`/api/lakes/${slug}/businesses`, { headers }),
        fetch(`/api/lakes/${slug}/discussions`, { headers })
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
      <div class="bg-frost rounded-lg p-4">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">❄️</span>
            <span class="badge bg-primary text-white text-xs">ICE CONDITION</span>
          </div>
          <span class="text-xs text-secondary">${this.formatDate(report.reportedAt)}</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="badge ${thicknessClass} text-white">${report.thicknessInches}"</span>
          ${report.condition ? `<span class="text-sm text-secondary capitalize">${report.condition}</span>` : ''}
        </div>
        ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}
        <div class="flex items-center gap-2 text-xs">
          <span class="font-medium">${report.user.displayName}</span>
          <span class="badge bg-secondary text-white">${report.user.rankTier}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render individual catch report card
   */
  renderCatchReportCard(report) {
    return `
      <div class="bg-frost rounded-lg p-4">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🐟</span>
            <span class="badge bg-evergreen text-white text-xs">CATCH REPORT</span>
          </div>
          <span class="text-xs text-secondary">${this.formatDate(report.caughtAt)}</span>
        </div>
        <div class="mb-2">
          <span class="font-bold text-sm">${report.fishSpecies}</span>
          ${report.fishCount > 1 ? `<span class="text-sm text-secondary"> (${report.fishCount})</span>` : ''}
        </div>
        ${this.renderCatchDetails(report)}
        ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}
        <div class="flex items-center gap-2 text-xs">
          <span class="font-medium">${report.user.displayName}</span>
          <span class="badge bg-secondary text-white">${report.user.rankTier}</span>
        </div>
      </div>
    `;
  },

  /**
   * Render individual snow report card
   */
  renderSnowReportCard(report) {
    return `
      <div class="bg-frost rounded-lg p-4">
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">❅</span>
            <span class="badge bg-ice text-white text-xs">SNOW REPORT</span>
          </div>
          <span class="text-xs text-secondary">${this.formatDate(report.reportedAt)}</span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="badge bg-primary text-white">${report.thicknessInches}" snow</span>
          <span class="text-sm text-secondary capitalize">${report.snowType}</span>
          <span class="text-sm text-secondary capitalize">${report.coverage}</span>
        </div>
        ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}
        <div class="flex items-center gap-2 text-xs">
          <span class="font-medium">${report.user.displayName}</span>
          <span class="badge bg-secondary text-white">${report.user.rankTier}</span>
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
    if (report.depthFeet) details.push(`${report.depthFeet}ft deep`);
    if (report.baitUsed) details.push(`Bait: ${report.baitUsed}`);

    return details.length > 0
      ? `<p class="text-sm text-secondary mb-2">${details.join(' • ')}</p>`
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
   * Render activity feed (builds from reports)
   */
  renderActivity() {
    const container = document.getElementById('activity-feed');
    if (!container) return;

    // Build activity from reports
    const activity = [];

    this.iceReports.forEach(report => {
      activity.push({
        type: 'ice',
        user: report.user.displayName,
        timestamp: this.formatDate(report.reportedAt),
        content: `Reported ${report.thicknessInches}" ice thickness (${report.condition || 'condition unknown'})${report.locationNotes ? '. ' + report.locationNotes : ''}`,
        likes: 0,
        comments: 0
      });
    });

    this.catchReports.forEach(report => {
      activity.push({
        type: 'catch',
        user: report.user.displayName,
        timestamp: this.formatDate(report.caughtAt),
        content: `Caught ${report.fishCount > 1 ? report.fishCount + ' ' : ''}${report.fishSpecies}${report.largestSizeInches ? ' (' + report.largestSizeInches + '")' : ''}${report.baitUsed ? ' using ' + report.baitUsed : ''}`,
        likes: 0,
        comments: 0
      });
    });

    this.snowReports.forEach(report => {
      activity.push({
        type: 'snow',
        user: report.user.displayName,
        timestamp: this.formatDate(report.reportedAt),
        content: `Reported ${report.thicknessInches}" of snow (${report.snowType}, ${report.coverage} coverage)${report.locationNotes ? '. ' + report.locationNotes : ''}`,
        likes: 0,
        comments: 0
      });
    });

    if (activity.length === 0) {
      container.innerHTML = `
        <div class="card text-center text-secondary py-8">
          <p>No recent activity for this lake.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = activity.map(post => {
      const typeInfo = this.ACTIVITY_TYPES[post.type] || this.ACTIVITY_TYPES.general;
      const initials = post.user.substring(0, 2).toUpperCase();

      return `
        <div class="card activity-post">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              ${initials}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold">${post.user}</span>
                <span class="text-xs text-secondary">${post.timestamp}</span>
              </div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded" style="background-color: ${typeInfo.color}20; color: ${typeInfo.color};">
                  ${typeInfo.icon} ${typeInfo.label}
                </span>
              </div>
              <p class="text-sm mb-3">${post.content}</p>
              <div class="flex items-center gap-4 text-xs text-secondary">
                <button class="flex items-center gap-1 hover:text-primary transition-colors">
                  <span>👍</span> ${post.likes} likes
                </button>
                <button class="flex items-center gap-1 hover:text-primary transition-colors">
                  <span>💬</span> ${post.comments} comments
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
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
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  LakeDetail.init();
});

// Export for use in other modules
window.LakeDetail = LakeDetail;
