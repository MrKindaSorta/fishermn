/**
 * Lake Detail Page Controller
 * Handles loading and displaying lake data from the API
 * Includes tabs, POI map, weather, activity feed, and discussions
 */

const LakeDetail = {
  lake: null,
  iceReports: [],
  catchReports: [],
  businesses: [],
  map: null,
  markers: {},
  currentThread: null,

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
    hotspot: { icon: '📍', label: 'HOTSPOT', color: '#D4AF37' },
    photo: { icon: '📸', label: 'PHOTO', color: '#0A3A60' },
    general: { icon: '💬', label: 'UPDATE', color: '#4B5563' }
  },

  // Weather icons
  WEATHER_ICONS: {
    sunny: '☀️',
    cloudy: '☁️',
    snow: '❄️',
    rain: '🌧️',
    storm: '⛈️'
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

    // Add report buttons
    const addIceBtn = document.getElementById('add-ice-report-btn');
    if (addIceBtn) {
      addIceBtn.addEventListener('click', () => this.showIceReportForm());
    }

    const addCatchBtn = document.getElementById('add-catch-report-btn');
    if (addCatchBtn) {
      addCatchBtn.addEventListener('click', () => this.showCatchReportForm());
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

      // Load lake data and businesses in parallel
      const [lakeResponse, businessesResponse] = await Promise.all([
        fetch(`/api/lakes/${slug}`, { headers }),
        fetch(`/api/lakes/${slug}/businesses`, { headers })
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

      // Load businesses
      if (businessesResponse.ok) {
        const businessesData = await businessesResponse.json();
        if (businessesData.success) {
          this.businesses = businessesData.businesses || [];
        }
      }

      // Render all sections
      this.render();

    } catch (error) {
      console.error('[LakeDetail] Error loading lake:', error);
      this.showError('Failed to load lake data. Please try again.');
    }
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
    this.renderIceReports();
    this.renderCatchReports();
    this.renderWeather();
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

    // Ice thickness
    document.getElementById('stat-thickness').textContent = ice.thickness ? `${ice.thickness}"` : 'Unknown';

    // Ice condition badge
    const badge = document.getElementById('lake-badge');
    const condition = ice.condition || 'unknown';
    badge.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
    badge.className = `badge ${this.getConditionBadgeClass(condition)} text-sm px-4 py-2`;

    // Ice updated date
    const iceUpdated = document.getElementById('ice-updated');
    if (ice.updatedAt) {
      iceUpdated.textContent = `Last updated: ${this.formatDate(ice.updatedAt)}`;
    } else {
      iceUpdated.textContent = '';
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
   * Render ice reports
   */
  renderIceReports() {
    const container = document.getElementById('ice-reports-list');
    if (!container) return;

    if (this.iceReports.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-secondary"><p>No ice reports yet. Be the first to report!</p></div>';
      return;
    }

    container.innerHTML = this.iceReports.map(report => `
      <div class="bg-frost rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">❄️</span>
            <span class="font-bold">${report.thicknessInches}"</span>
            <span class="badge ${this.getConditionBadgeClass(report.condition)} text-xs">${report.condition || 'Unknown'}</span>
          </div>
          <span class="text-xs text-secondary">${this.formatDate(report.reportedAt)}</span>
        </div>
        ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}
        <div class="flex items-center gap-2 text-xs text-secondary">
          <span>Reported by ${report.user.displayName}</span>
          <span class="badge bg-primary/10 text-primary">${report.user.rankTier}</span>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render catch reports
   */
  renderCatchReports() {
    const container = document.getElementById('catch-reports-list');
    if (!container) return;

    if (this.catchReports.length === 0) {
      container.innerHTML = '<div class="text-center py-4 text-secondary"><p>No catch reports yet. Share your catches!</p></div>';
      return;
    }

    container.innerHTML = this.catchReports.map(report => `
      <div class="bg-frost rounded-lg p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">🐟</span>
            <span class="font-bold">${report.fishSpecies}</span>
            ${report.fishCount > 1 ? `<span class="text-secondary">x${report.fishCount}</span>` : ''}
          </div>
          <span class="text-xs text-secondary">${this.formatDate(report.caughtAt)}</span>
        </div>
        <div class="flex flex-wrap gap-3 text-sm mb-2">
          ${report.largestSizeInches ? `<span>${report.largestSizeInches}" length</span>` : ''}
          ${report.largestWeightLbs ? `<span>${report.largestWeightLbs} lbs</span>` : ''}
          ${report.depthFeet ? `<span>${report.depthFeet}ft deep</span>` : ''}
          ${report.baitUsed ? `<span>Bait: ${report.baitUsed}</span>` : ''}
        </div>
        ${report.locationNotes ? `<p class="text-sm text-secondary mb-2">${report.locationNotes}</p>` : ''}
        <div class="flex items-center gap-2 text-xs text-secondary">
          <span>Caught by ${report.user.displayName}</span>
          <span class="badge bg-primary/10 text-primary">${report.user.rankTier}</span>
        </div>
      </div>
    `).join('');
  },

  /**
   * Render weather widget (mock data for now)
   */
  renderWeather() {
    // Mock weather data - will be replaced with actual API
    const weather = {
      temp: 28,
      feelsLike: 22,
      wind: { direction: 'NW', speed: 12 },
      conditions: 'Partly Cloudy',
      forecast: [
        { day: 'Tue', high: 30, low: 18, icon: 'cloudy' },
        { day: 'Wed', high: 25, low: 12, icon: 'snow' },
        { day: 'Thu', high: 22, low: 8, icon: 'sunny' }
      ]
    };

    document.getElementById('weather-temp').textContent = `${weather.temp}°F`;
    document.getElementById('weather-feels').textContent = `${weather.feelsLike}°F`;
    document.getElementById('weather-conditions').textContent = `${weather.wind.direction} ${weather.wind.speed} mph • ${weather.conditions}`;

    const forecastContainer = document.getElementById('forecast-container');
    if (forecastContainer && weather.forecast) {
      forecastContainer.innerHTML = weather.forecast.map(day => `
        <div class="weather-forecast-day text-center">
          <p class="text-xs text-muted mb-1">${day.day}</p>
          <p class="text-xl mb-1">${this.WEATHER_ICONS[day.icon] || '🌤️'}</p>
          <p class="text-xs font-medium">${day.high}° / ${day.low}°</p>
        </div>
      `).join('');
    }
  },

  /**
   * Render activity feed (builds from reports for now)
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
   * Render discussions (mock data for now)
   */
  renderDiscussions() {
    const threadList = document.getElementById('thread-list');
    const threadCount = document.getElementById('thread-count');

    // Mock discussions - will be replaced with API
    const discussions = [
      {
        id: 1,
        title: 'Best spots for walleye this week?',
        author: 'IceFisher_Mike',
        replyCount: 12,
        lastReplyAt: '2h ago',
        createdAt: 'Dec 5, 2024',
        pinned: false,
        posts: [
          { author: 'IceFisher_Mike', content: 'Anyone having luck with walleye lately? Thinking of heading out this weekend.', timestamp: 'Dec 5, 2024', isOP: true },
          { author: 'WalleyeKing', content: 'Try the north end near the drop-off. Was pulling them in yesterday around 6pm.', timestamp: 'Dec 5, 2024', isOP: false },
          { author: 'MNAngler', content: 'Second that! North end has been hot. Use minnows.', timestamp: 'Dec 6, 2024', isOP: false }
        ]
      },
      {
        id: 2,
        title: 'Ice conditions update - Dec 7th',
        author: 'SafetyFirst',
        replyCount: 5,
        lastReplyAt: '5h ago',
        createdAt: 'Dec 7, 2024',
        pinned: true,
        posts: [
          { author: 'SafetyFirst', content: 'Checked the main access today. 8-10 inches of good ice. Stay away from the inlet area though.', timestamp: 'Dec 7, 2024', isOP: true },
          { author: 'LocalGuide', content: 'Thanks for the update! Any pressure cracks?', timestamp: 'Dec 7, 2024', isOP: false }
        ]
      }
    ];

    if (discussions.length === 0) {
      threadList.innerHTML = '<div class="p-4 text-center text-secondary"><p>No discussions yet.</p></div>';
      threadCount.textContent = '0 threads';
      return;
    }

    threadCount.textContent = `${discussions.length} threads`;

    threadList.innerHTML = discussions.map((thread, index) => {
      const pinnedIcon = thread.pinned ? '<span class="text-gold">📌</span> ' : '';
      return `
        <div class="thread-item p-4 border-b border-grayPanel ${index === 0 ? 'active' : ''}"
             data-thread-id="${thread.id}"
             onclick="LakeDetail.selectThread(${thread.id})">
          <h4 class="font-semibold text-sm mb-1 line-clamp-2">${pinnedIcon}${thread.title}</h4>
          <p class="text-xs text-secondary">
            Started by ${thread.author} • ${thread.replyCount} replies • Last: ${thread.lastReplyAt}
          </p>
        </div>
      `;
    }).join('');

    // Store discussions for thread selection
    this._discussions = discussions;

    // Select first thread by default
    if (discussions.length > 0) {
      this.selectThread(discussions[0].id);
    }
  },

  /**
   * Select a discussion thread
   */
  selectThread(threadId) {
    if (!this._discussions) return;

    const thread = this._discussions.find(t => t.id === threadId);
    if (!thread) return;

    this.currentThread = thread;

    // Update active state in thread list
    document.querySelectorAll('.thread-item').forEach(item => {
      item.classList.remove('active');
      if (parseInt(item.dataset.threadId) === threadId) {
        item.classList.add('active');
      }
    });

    // Update thread header
    document.getElementById('thread-title').textContent = thread.title;
    document.getElementById('thread-meta').textContent = `Posted by ${thread.author} • ${thread.createdAt}`;

    // Populate thread content
    const contentContainer = document.getElementById('thread-content');
    contentContainer.innerHTML = thread.posts.map(post => {
      const initials = post.author.substring(0, 2).toUpperCase();
      const opBadge = post.isOP ? '<span class="text-xs bg-primary text-white px-2 py-0.5 rounded ml-2">OP</span>' : '';

      return `
        <div class="mb-4 p-4 rounded-lg ${post.isOP ? 'bg-frost border border-grayPanel' : 'bg-white border border-grayPanel'}">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full ${post.isOP ? 'bg-primary' : 'bg-secondary'} flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              ${initials}
            </div>
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <span class="font-semibold text-sm">${post.author}</span>
                ${opBadge}
                <span class="text-xs text-secondary ml-auto">${post.timestamp}</span>
              </div>
              <p class="text-sm">${post.content}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

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
   * Show ice report form
   */
  showIceReportForm() {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }
    alert('Ice report form coming soon!');
  },

  /**
   * Show catch report form
   */
  showCatchReportForm() {
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }
    alert('Catch report form coming soon!');
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
