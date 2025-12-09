/**
 * Lake Detail Page Controller
 * Handles loading and displaying lake data from the API
 */

const LakeDetail = {
  lake: null,
  iceReports: [],
  catchReports: [],

  /**
   * Initialize the lake detail page
   */
  async init() {
    // Get lake slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('id');

    if (!slug) {
      this.showError('No lake specified');
      return;
    }

    await this.loadLakeData(slug);
  },

  /**
   * Load lake data from API
   */
  async loadLakeData(slug) {
    try {
      this.showLoading();

      const token = localStorage.getItem('fishermn_auth_token');
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/lakes/${slug}`, { headers });

      if (!response.ok) {
        if (response.status === 404) {
          this.showError('Lake not found');
          return;
        }
        throw new Error('Failed to load lake data');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load lake data');
      }

      this.lake = data.lake;
      this.iceReports = data.iceReports || [];
      this.catchReports = data.catchReports || [];

      this.render();

    } catch (error) {
      console.error('[LakeDetail] Error loading lake:', error);
      this.showError('Failed to load lake data. Please try again.');
    }
  },

  /**
   * Render the lake detail page
   */
  render() {
    const container = document.getElementById('lake-content');
    if (!container) return;

    const lake = this.lake;
    const ice = lake.officialIce;

    // Determine ice badge color
    let iceBadgeClass = 'bg-grayPanel text-secondary';
    if (ice.condition === 'excellent') iceBadgeClass = 'bg-evergreen text-white';
    else if (ice.condition === 'good') iceBadgeClass = 'bg-gold text-white';
    else if (ice.condition === 'fair') iceBadgeClass = 'bg-gold text-white';
    else if (ice.condition === 'poor' || ice.condition === 'dangerous') iceBadgeClass = 'bg-red-500 text-white';

    // Build amenities list
    const amenities = [];
    if (lake.amenities.hasBaitShop) amenities.push('<span>Bait Shop</span>');
    if (lake.amenities.barsCount > 0) amenities.push(`<span>${lake.amenities.barsCount} Bars</span>`);
    if (lake.amenities.hasCasino) amenities.push('<span>Casino</span>');
    if (lake.amenities.hasIceHouseRental) amenities.push('<span>Ice House Rental</span>');
    if (lake.amenities.hasLodging) amenities.push('<span>Lodging</span>');
    if (lake.amenities.hasRestaurant) amenities.push('<span>Restaurant</span>');
    if (lake.amenities.hasBoatLaunch) amenities.push('<span>Boat Launch</span>');
    if (lake.amenities.hasGasStation) amenities.push('<span>Gas Station</span>');
    if (lake.amenities.hasGrocery) amenities.push('<span>Grocery</span>');
    if (lake.amenities.hasGuideService) amenities.push('<span>Guide Service</span>');

    // Update page title
    document.title = `FisherMN - ${lake.name}`;

    container.innerHTML = `
      <!-- Lake Header -->
      <div class="card mb-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-primary">${lake.name}</h1>
            <p class="text-secondary">${lake.region || 'Minnesota'}</p>
          </div>
          <button
            id="favorite-btn"
            onclick="LakeDetail.toggleFavorite()"
            class="p-2 rounded-lg border ${lake.isFavorited ? 'bg-gold border-gold text-white' : 'border-grayPanel text-secondary hover:border-gold hover:text-gold'} transition-colors"
            title="${lake.isFavorited ? 'Remove from favorites' : 'Add to favorites'}"
          >
            <svg class="w-6 h-6" fill="${lake.isFavorited ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Ice Conditions -->
        <div class="bg-frost rounded-lg p-4 mb-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">❄️</span>
              <div>
                <p class="text-sm text-secondary">Official Ice Thickness</p>
                <p class="text-2xl font-bold">${ice.thickness ? ice.thickness + '"' : 'Unknown'}</p>
              </div>
            </div>
            <span class="badge ${iceBadgeClass} text-sm px-4 py-2">
              ${ice.condition ? ice.condition.charAt(0).toUpperCase() + ice.condition.slice(1) : 'Unknown'}
            </span>
          </div>
          ${ice.updatedAt ? `<p class="text-xs text-secondary mt-2">Last updated: ${this.formatDate(ice.updatedAt)}</p>` : ''}
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary">${lake.reportCounts.iceCount}</p>
            <p class="text-xs text-secondary">Ice Reports</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-evergreen">${lake.reportCounts.catchCount}</p>
            <p class="text-xs text-secondary">Catch Reports</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gold">${lake.reportCounts.totalCount}</p>
            <p class="text-xs text-secondary">Total Reports</p>
          </div>
        </div>

        <!-- Amenities -->
        ${amenities.length > 0 ? `
          <div class="border-t border-grayPanel pt-4">
            <p class="text-sm font-semibold mb-2">Amenities</p>
            <div class="flex flex-wrap gap-2 text-xs text-secondary">
              ${amenities.join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Map -->
      <div class="card mb-6">
        <h2 class="text-lg font-bold mb-4">Location</h2>
        <div id="lake-map" class="h-64 rounded-lg"></div>
      </div>

      <!-- Ice Reports Section -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Recent Ice Reports</h2>
          <button
            onclick="LakeDetail.showIceReportForm()"
            class="btn-primary text-sm py-2 px-4 ${!Auth.isAuthenticated() ? 'opacity-50 cursor-not-allowed' : ''}"
            ${!Auth.isAuthenticated() ? 'disabled title="Login required"' : ''}
          >
            + Add Report
          </button>
        </div>

        ${this.iceReports.length > 0 ? `
          <div class="space-y-3">
            ${this.iceReports.map(report => this.renderIceReport(report)).join('')}
          </div>
        ` : `
          <div class="text-center py-8 text-secondary">
            <p>No ice reports yet. Be the first to report!</p>
          </div>
        `}
      </div>

      <!-- Catch Reports Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">Recent Catches</h2>
          <button
            onclick="LakeDetail.showCatchReportForm()"
            class="btn-primary text-sm py-2 px-4 ${!Auth.isAuthenticated() ? 'opacity-50 cursor-not-allowed' : ''}"
            ${!Auth.isAuthenticated() ? 'disabled title="Login required"' : ''}
          >
            + Add Catch
          </button>
        </div>

        ${this.catchReports.length > 0 ? `
          <div class="space-y-3">
            ${this.catchReports.map(report => this.renderCatchReport(report)).join('')}
          </div>
        ` : `
          <div class="text-center py-8 text-secondary">
            <p>No catch reports yet. Share your catches!</p>
          </div>
        `}
      </div>
    `;

    // Initialize map after rendering
    this.initMap();
  },

  /**
   * Render a single ice report
   */
  renderIceReport(report) {
    return `
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
    `;
  },

  /**
   * Render a single catch report
   */
  renderCatchReport(report) {
    return `
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
   * Initialize the map
   */
  initMap() {
    if (!this.lake || typeof L === 'undefined') return;

    const mapEl = document.getElementById('lake-map');
    if (!mapEl) return;

    const map = L.map('lake-map').setView([this.lake.latitude, this.lake.longitude], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Add marker
    L.marker([this.lake.latitude, this.lake.longitude])
      .addTo(map)
      .bindPopup(`<b>${this.lake.name}</b>`)
      .openPopup();
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite() {
    if (!Auth.isAuthenticated()) {
      AuthModal.open();
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
    if (!Auth.isAuthenticated()) {
      AuthModal.open();
      return;
    }
    // TODO: Implement ice report modal
    alert('Ice report form coming soon!');
  },

  /**
   * Show catch report form
   */
  showCatchReportForm() {
    if (!Auth.isAuthenticated()) {
      AuthModal.open();
      return;
    }
    // TODO: Implement catch report modal
    alert('Catch report form coming soon!');
  },

  /**
   * Show loading state
   */
  showLoading() {
    const container = document.getElementById('lake-content');
    if (!container) return;

    container.innerHTML = `
      <div class="card text-center py-20">
        <div class="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-secondary">Loading lake data...</p>
      </div>
    `;
  },

  /**
   * Show error state
   */
  showError(message) {
    const container = document.getElementById('lake-content');
    if (!container) return;

    container.innerHTML = `
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
