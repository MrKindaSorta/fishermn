/**
 * LakesList - Dynamic lake listing with map integration
 * Fetches lake data from D1 database via API and renders tiles + map markers
 */
class LakesList {
  constructor() {
    this.lakes = [];              // All loaded lakes (accumulates with scroll)
    this.currentOffset = 0;       // Pagination offset
    this.hasMore = true;          // Whether more lakes exist
    this.isLoading = false;       // Prevent duplicate loads
    this.totalLakes = 0;          // Total lakes in DB
    this.searchMode = false;      // Whether in search mode
    this.filterActive = false;    // Whether filters are active
    this.map = null;
    this.markers = [];
    this.activeLakeId = null;
    this.scrollThreshold = 400;   // Load more at 400th lake
    this.viewportFilterActive = false; // Track if filtering by viewport
    this.updateListDebounced = null; // Debounced list update function
  }

  async init() {
    try {
      await this.loadLakes(0, false); // Load first 500 (for list)
      this.initMap();
      this.renderLakeTiles();

      // Split lakes into priority groups
      const lakesWithIce = this.lakes.filter(l => l.officialIce?.thickness);
      const lakesWithoutIce = this.lakes.filter(l => !l.officialIce?.thickness);

      // Initial markers: ice data lakes first, then others (up to 100 total)
      let initialMarkers = lakesWithIce.slice(0, 100);
      if (initialMarkers.length < 100) {
        const remaining = 100 - initialMarkers.length;
        initialMarkers = [...initialMarkers, ...lakesWithoutIce.slice(0, remaining)];
      }

      this.renderMapMarkers(initialMarkers);

      this.initFilters();
      this.initInfiniteScroll(); // Set up scroll detection

      console.log(`Initialized with ${this.lakes.length}/${this.totalLakes} lakes, showing ${initialMarkers.length} markers (${lakesWithIce.slice(0, 100).length} with ice data)`);
    } catch (error) {
      console.error('Failed to initialize lakes page:', error);
      this.showError('Failed to load lakes. Please refresh the page.');
    }
  }

  /**
   * Fetch lakes from API with pagination
   * @param {number} offset - Pagination offset
   * @param {boolean} append - Whether to append to existing lakes or replace
   */
  async loadLakes(offset = 0, append = false) {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const response = await fetch(`/api/lakes?limit=500&offset=${offset}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'API error');

      if (append) {
        this.lakes = [...this.lakes, ...(data.lakes || [])];
      } else {
        this.lakes = data.lakes || [];
      }

      this.hasMore = data.hasMore || false;
      this.totalLakes = data.total || 0;
      this.currentOffset = offset + (data.lakes?.length || 0);

      console.log(`Loaded ${data.count} lakes (${this.lakes.length}/${this.totalLakes} total)`);

      if (this.lakes.length === 0) {
        this.showEmptyState();
      }
    } catch (error) {
      console.error('Error loading lakes:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Initialize Leaflet map
   */
  initMap() {
    this.map = L.map('map').setView([46.5, -94.0], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 6
    }).addTo(this.map);

    // Create debounced update function (300ms delay)
    this.updateListDebounced = this.debounce(() => {
      this.updateViewportFilteredList();
    }, 300);

    // Add viewport sync listeners
    this.map.on('moveend', () => {
      this.updateListDebounced();
    });

    this.map.on('zoomend', () => {
      this.updateListDebounced();
    });
  }

  /**
   * Initialize infinite scroll detection
   */
  initInfiniteScroll() {
    const lakesListContainer = document.getElementById('lakes-list');
    if (!lakesListContainer) return;

    lakesListContainer.addEventListener('scroll', () => {
      if (this.isLoading || !this.hasMore || this.searchMode || this.filterActive) return;

      // Check if scrolled to threshold (400th lake)
      const tiles = lakesListContainer.querySelectorAll('.lake-list-item');

      // Find which lake is currently in view
      let visibleLakeIndex = 0;
      tiles.forEach((tile, index) => {
        const rect = tile.getBoundingClientRect();
        const containerRect = lakesListContainer.getBoundingClientRect();
        // Check if tile is in the upper half of the visible container
        if (rect.top < containerRect.top + containerRect.height / 2) {
          visibleLakeIndex = index;
        }
      });

      // Load more when reaching threshold
      if (visibleLakeIndex >= this.scrollThreshold && this.hasMore) {
        this.loadMoreLakes();
      }
    });
  }

  /**
   * Load more lakes (infinite scroll)
   */
  async loadMoreLakes() {
    if (this.isLoading || !this.hasMore) return;

    console.log(`Loading more lakes from offset ${this.currentOffset}...`);
    this.showLoadingMore();

    try {
      await this.loadLakes(this.currentOffset, true); // append mode

      // Append new tiles to existing list
      const container = document.getElementById('lakes-list');
      const newTilesHTML = this.lakes
        .slice(this.currentOffset - 500, this.currentOffset)
        .map(lake => this.createLakeTileHTML(lake))
        .join('');

      this.removeLoadingMore();
      container.insertAdjacentHTML('beforeend', newTilesHTML);

      // Update map markers with all loaded lakes
      this.renderMapMarkers();
    } catch (error) {
      console.error('Error loading more lakes:', error);
      this.removeLoadingMore();
    }
  }

  /**
   * Search lakes server-side (searches ALL lakes in DB)
   */
  async searchLakes(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      // Clear search - return to browse mode
      this.searchMode = false;
      this.currentOffset = 0;
      this.hasMore = true;
      this.lakes = [];
      await this.init(); // Reload initial 500
      return;
    }

    this.searchMode = true;
    this.isLoading = true;

    try {
      const response = await fetch(`/api/lakes?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'API error');

      this.lakes = data.lakes || [];
      this.hasMore = false; // No pagination in search mode

      console.log(`Search found ${data.count} lakes matching "${searchTerm}"`);

      this.renderLakeTiles();
      this.renderMapMarkers();
    } catch (error) {
      console.error('Error searching lakes:', error);
      this.showError('Search failed. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render lake tiles in the list
   */
  renderLakeTiles(lakesToRender = null) {
    const lakes = lakesToRender || this.lakes;
    const container = document.getElementById('lakes-list');

    if (lakes.length === 0) {
      if (this.viewportFilterActive) {
        // Show viewport-specific empty state
        container.innerHTML = `
          <div class="p-6 text-center text-secondary">
            <p>No lakes in current map view</p>
            <p class="text-xs mt-2">Zoom out or pan to see more lakes</p>
          </div>
        `;
      } else {
        this.showEmptyFilterState();
      }
      return;
    }

    container.innerHTML = lakes.map(lake => this.createLakeTileHTML(lake)).join('');

    // Show count indicator when viewport filter is active
    if (this.viewportFilterActive) {
      const countIndicator = document.getElementById('lake-count-indicator');
      if (countIndicator) {
        countIndicator.textContent = `Showing ${lakes.length} of ${this.lakes.length} lakes`;
      }
    }
  }

  /**
   * Generate HTML for a single lake tile
   */
  createLakeTileHTML(lake) {
    const thickness = lake.officialIce?.thickness || null;
    const condition = lake.officialIce?.condition || '';
    const thicknessClass = this.getThicknessClass(thickness);
    const thicknessValue = thickness !== null ? thickness : '--';

    return `
      <div class="lake-list-item card py-3 px-4"
           onclick="window.lakesList.flyToLake('${lake.id}', ${lake.latitude}, ${lake.longitude})"
           data-lake-name="${this.escapeHtml(lake.name)}"
           data-condition="${this.escapeHtml(condition)}"
           data-thickness="${thicknessValue}"
           data-casino="${lake.amenities?.hasCasino || false}"
           data-bars="${lake.amenities?.barsCount || 0}"
           data-resort="${lake.amenities?.hasLodging || false}"
           data-baitshop="${lake.amenities?.hasBaitShop || false}"
           data-icehouse="${lake.amenities?.hasIceHouseRental || false}"
           data-lodging="${lake.amenities?.hasLodging || false}"
           data-restaurant="${lake.amenities?.hasRestaurant || false}"
           data-boatlaunch="${lake.amenities?.hasBoatLaunch || false}"
           data-gasstation="${lake.amenities?.hasGasStation || false}"
           data-grocery="${lake.amenities?.hasGrocery || false}"
           data-guideservice="${lake.amenities?.hasGuideService || false}">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="font-bold text-base">${this.escapeHtml(lake.name)}</h3>
            <p class="text-xs text-secondary">${this.escapeHtml(lake.region || 'Minnesota')}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${thicknessClass} text-white text-xs px-3 py-1">${thicknessValue}"</span>
            <a href="/lake.html?id=${encodeURIComponent(lake.slug)}"
               class="text-xs px-3 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
               onclick="event.stopPropagation()">
              View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get badge color class based on ice thickness
   */
  getThicknessClass(thickness) {
    if (!thickness || thickness < 6) return 'bg-orange';
    if (thickness < 12) return 'bg-gold';
    return 'bg-evergreen';
  }

  /**
   * Render map markers with optional priority mode
   * @param {Array} lakesToRender - Lakes to render (default: all loaded lakes)
   * @param {boolean} priorityMode - If true, prioritize ice data lakes
   */
  renderMapMarkers(lakesToRender = null, priorityMode = false) {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];

    const lakes = lakesToRender || this.lakes;

    if (priorityMode) {
      // Viewport mode: ALL ice data lakes + others (up to 500 total)
      const lakesWithIce = lakes.filter(l => l.officialIce?.thickness);
      const lakesWithoutIce = lakes.filter(l => !l.officialIce?.thickness);

      // Show ALL ice data lakes (no limit - always visible!)
      let lakesToShow = [...lakesWithIce];

      // Fill remaining up to 500 with others
      if (lakesToShow.length < 500) {
        const remaining = 500 - lakesToShow.length;
        lakesToShow = [...lakesToShow, ...lakesWithoutIce.slice(0, remaining)];
      }

      lakesToShow.forEach(lake => this.createMarker(lake));

    } else {
      // Normal mode: render all provided lakes
      lakes.forEach(lake => this.createMarker(lake));
    }
  }

  /**
   * Create individual marker
   * @param {Object} lake - Lake object
   */
  createMarker(lake) {
    const thickness = lake.officialIce?.thickness;
    const condition = lake.officialIce?.condition || 'N/A';

    // Get color based on ice thickness (or default gray for lakes without data)
    const color = thickness ? this.getMarkerColor(thickness) : '#6B7280'; // Gray for no data

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker([lake.latitude, lake.longitude], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${this.escapeHtml(lake.name)}</h3>
          <p style="font-size: 12px; color: #4B5563; margin-bottom: 8px;">
            ${thickness ? `Ice: ${thickness}" • ${this.escapeHtml(condition)}` : 'No ice data available'}
          </p>
          <a href="/lake.html?id=${encodeURIComponent(lake.slug)}"
             style="color: #0A3A60; text-decoration: underline; font-size: 12px;">
            View Lake Page →
          </a>
        </div>
      `);

    this.markers.push(marker);
  }

  /**
   * Get marker color based on thickness
   */
  getMarkerColor(thickness) {
    if (thickness < 6) return '#FF8C00'; // Orange
    if (thickness < 12) return '#D4AF37'; // Gold
    return '#22C55E'; // Green
  }

  /**
   * Fetch lakes within current map viewport from API
   * @returns {Promise<Array>} Lakes in viewport
   */
  async fetchViewportLakes() {
    if (!this.map) return [];

    const bounds = this.map.getBounds();
    const params = new URLSearchParams({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
      limit: 500  // Still paginate within viewport
    });

    try {
      const response = await fetch(`/api/lakes?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch lakes');

      return data.lakes;
    } catch (error) {
      console.error('Error fetching viewport lakes:', error);
      return [];
    }
  }

  /**
   * Update list and markers to show only lakes visible on map
   * Fetches from API (server-side filtering)
   */
  async updateViewportFilteredList() {
    this.viewportFilterActive = true;

    // Fetch lakes in viewport from API
    const viewportLakes = await this.fetchViewportLakes();

    // Update list tiles (async, non-blocking)
    requestAnimationFrame(() => {
      this.renderLakeTiles(viewportLakes);
    });

    // Update markers with priority mode: ALL ice data lakes + others
    this.renderMapMarkers(viewportLakes, true);
  }

  /**
   * Debounce utility to prevent excessive updates
   * @param {Function} func - Function to debounce
   * @param {number} wait - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Fly to lake on map and highlight tile
   */
  flyToLake(lakeId, lat, lon) {
    // Remove active class from all tiles
    document.querySelectorAll('.lake-list-item').forEach(item => {
      item.classList.remove('active');
    });

    // Add active class to clicked tile
    const tiles = document.querySelectorAll('.lake-list-item');
    tiles.forEach(tile => {
      const tileName = tile.getAttribute('data-lake-name');
      const clickedLake = this.lakes.find(l => l.id === lakeId);
      if (tileName === clickedLake?.name) {
        tile.classList.add('active');
      }
    });

    // Fly to location on map
    this.map.flyTo([lat, lon], 11, {
      duration: 1.5
    });

    this.activeLakeId = lakeId;
  }

  /**
   * Initialize filter event listeners
   */
  initFilters() {
    // Search input with debouncing for server-side search + filters
    const searchInput = document.getElementById('lake-search');
    if (searchInput) {
      // Remove inline handler
      searchInput.setAttribute('onkeyup', '');

      let searchTimeout;
      const handleSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilters(); // Use unified filtering system
        }, 300); // 300ms debounce
      };

      searchInput.addEventListener('input', handleSearch);
      searchInput.addEventListener('keyup', handleSearch);
    }

    // Ice thickness select dropdown
    const thicknessSelect = document.getElementById('filter-condition');
    if (thicknessSelect) {
      thicknessSelect.addEventListener('change', () => {
        this.applyFilters();
      });
    }

    // Bar counter buttons
    const decreaseBtn = document.querySelector('[onclick="adjustBarCounter(-1)"]');
    const increaseBtn = document.querySelector('[onclick="adjustBarCounter(1)"]');
    if (decreaseBtn) {
      decreaseBtn.setAttribute('onclick', '');
      decreaseBtn.addEventListener('click', () => this.adjustBarCounter(-1));
    }
    if (increaseBtn) {
      increaseBtn.setAttribute('onclick', '');
      increaseBtn.addEventListener('click', () => this.adjustBarCounter(1));
    }

    // Amenity checkboxes
    const amenityCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="filter-"]');
    amenityCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.applyFilters());
    });

    // Filter toggle - attach to the clickable div
    const filterToggleDiv = document.querySelector('.cursor-pointer[onclick*="toggleFilters"]');
    if (filterToggleDiv) {
      filterToggleDiv.setAttribute('onclick', '');
      filterToggleDiv.addEventListener('click', () => this.toggleFilters());
    }

    // Clear filters button
    const clearBtn = document.querySelector('button[onclick*="clearFilters"]');
    if (clearBtn) {
      clearBtn.setAttribute('onclick', '');
      clearBtn.addEventListener('click', () => this.clearFilters());
    }

    // Sort button
    const sortBtn = document.querySelector('button[onclick*="sortLakesAlphabetically"]');
    if (sortBtn) {
      sortBtn.setAttribute('onclick', '');
      sortBtn.addEventListener('click', () => this.sortLakesAlphabetically());
    }
  }

  /**
   * Build filter parameters for API call
   * @returns {URLSearchParams|null} Filter parameters or null if no filters active
   */
  buildFilterParams() {
    const params = new URLSearchParams();
    let hasAnyFilter = false;

    // Search term
    const searchTerm = document.getElementById('lake-search')?.value || '';
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
      hasAnyFilter = true;
    }

    // Ice thickness filter
    const thicknessFilter = parseInt(document.getElementById('filter-condition')?.value || '0');
    if (thicknessFilter > 0) {
      params.append('minThickness', thicknessFilter);
      hasAnyFilter = true;
    }

    // Bars count filter
    const barsFilter = parseInt(document.getElementById('bars-counter')?.value || '0');
    if (barsFilter > 0) {
      params.append('minBars', barsFilter);
      hasAnyFilter = true;
    }

    // Amenity filters
    const amenityFilters = {
      'filter-casino': 'hasCasino',
      'filter-baitshop': 'hasBaitShop',
      'filter-icehouse': 'hasIceHouseRental',
      'filter-lodging': 'hasLodging',
      'filter-restaurant': 'hasRestaurant',
      'filter-boatlaunch': 'hasBoatLaunch',
      'filter-gasstation': 'hasGasStation',
      'filter-grocery': 'hasGrocery',
      'filter-guideservice': 'hasGuideService'
    };

    const selectedAmenities = [];
    for (const [checkboxId, amenityKey] of Object.entries(amenityFilters)) {
      const checkbox = document.getElementById(checkboxId);
      if (checkbox?.checked) {
        selectedAmenities.push(amenityKey);
        hasAnyFilter = true;
      }
    }

    if (selectedAmenities.length > 0) {
      params.append('amenities', selectedAmenities.join(','));
    }

    return hasAnyFilter ? params : null;
  }

  /**
   * Apply all active filters (server-side)
   */
  async applyFilters() {
    const filterParams = this.buildFilterParams();

    // If no filters, reload initial 500 lakes with pagination
    if (!filterParams) {
      this.filterActive = false;
      this.searchMode = false;
      this.currentOffset = 0;
      this.hasMore = true;
      this.lakes = [];

      try {
        await this.loadLakes(0, false);
        this.renderLakeTiles();
        this.renderMapMarkers();
      } catch (error) {
        console.error('Error reloading lakes:', error);
        this.showError('Failed to load lakes. Please refresh the page.');
      }
      return;
    }

    // Filters are active - fetch ALL matching lakes from API
    this.filterActive = true;
    this.isLoading = true;
    this.showLoading();

    try {
      const response = await fetch(`/api/lakes?${filterParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'API error');

      this.lakes = data.lakes || [];
      this.hasMore = false; // No pagination when filters active

      console.log(`Filters applied: ${data.count} lakes match criteria`);

      // Update UI
      this.renderLakeTiles();
      this.renderMapMarkers();

      // Update filter count badge
      const filterCount = document.getElementById('filter-count');
      if (filterCount) {
        const numFilters = this.countActiveFilters();
        if (numFilters > 0) {
          filterCount.textContent = numFilters;
          filterCount.classList.remove('hidden');
        } else {
          filterCount.classList.add('hidden');
        }
      }

    } catch (error) {
      console.error('Error applying filters:', error);
      this.showError('Failed to apply filters. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Count number of active filters
   * @returns {number} Number of active filters
   */
  countActiveFilters() {
    let count = 0;

    // Ice thickness
    const thickness = parseInt(document.getElementById('filter-condition')?.value || '0');
    if (thickness > 0) count++;

    // Bars
    const bars = parseInt(document.getElementById('bars-counter')?.value || '0');
    if (bars > 0) count++;

    // Amenity checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="filter-"]');
    checkboxes.forEach(cb => {
      if (cb.checked) count++;
    });

    return count;
  }

  /**
   * Adjust bar counter
   */
  adjustBarCounter(delta) {
    const counter = document.getElementById('bars-counter');
    const display = document.getElementById('bars-count');
    const label = document.getElementById('bars-label');
    const minusBtn = document.getElementById('bars-minus');
    const plusBtn = document.getElementById('bars-plus');

    if (!counter) return;

    let value = parseInt(counter.value) + delta;
    value = Math.max(0, Math.min(10, value));

    // Update hidden input
    counter.value = value;

    // Update display
    if (display) display.textContent = value;

    // Show/hide "or more" label
    if (label) {
      if (value > 0) {
        label.classList.remove('hidden');
      } else {
        label.classList.add('hidden');
      }
    }

    // Update button states
    if (minusBtn) minusBtn.disabled = (value === 0);
    if (plusBtn) plusBtn.disabled = (value === 10);

    this.applyFilters();
  }

  /**
   * Toggle filter panel visibility
   */
  toggleFilters() {
    const content = document.getElementById('filter-content');
    const chevron = document.getElementById('filter-chevron');

    if (content && chevron) {
      const isHidden = content.classList.contains('hidden');

      if (isHidden) {
        content.classList.remove('hidden');
        chevron.classList.add('rotate-180');
      } else {
        content.classList.add('hidden');
        chevron.classList.remove('rotate-180');
      }
    }
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Reset search
    const searchInput = document.getElementById('lake-search');
    if (searchInput) searchInput.value = '';

    // Reset ice thickness dropdown (FIXED ID)
    const thicknessSelect = document.getElementById('filter-condition');
    if (thicknessSelect) thicknessSelect.value = '';

    // Reset bar counter (hidden input + display + label)
    const barsCounter = document.getElementById('bars-counter');
    const barsDisplay = document.getElementById('bars-count');
    const barsLabel = document.getElementById('bars-label');
    if (barsCounter) barsCounter.value = '0';
    if (barsDisplay) barsDisplay.textContent = '0';
    if (barsLabel) barsLabel.classList.add('hidden');

    // Update button states
    const minusBtn = document.getElementById('bars-minus');
    const plusBtn = document.getElementById('bars-plus');
    if (minusBtn) minusBtn.disabled = true;
    if (plusBtn) plusBtn.disabled = false;

    // Uncheck all amenity checkboxes
    document.querySelectorAll('input[type="checkbox"][id^="filter-"]').forEach(checkbox => {
      checkbox.checked = false;
    });

    // Reset filter state and reload initial data
    this.filterActive = false;
    this.applyFilters();
  }

  /**
   * Wrapper function for inline HTML event handler
   */
  filterLakes() {
    const input = document.getElementById('lake-search');
    if (input) {
      this.searchLakes(input.value.trim());
    }
  }

  /**
   * Sort lakes alphabetically with letters first, then numbers/special characters
   */
  sortLakesAlphabetically() {
    this.lakes.sort((a, b) => {
      // Check if first character is alphabetic
      const aIsAlpha = /^[A-Za-z]/.test(a.name);
      const bIsAlpha = /^[A-Za-z]/.test(b.name);

      // If one starts with letter and one doesn't, letter comes first
      if (aIsAlpha !== bIsAlpha) {
        return aIsAlpha ? -1 : 1;
      }

      // Both start with letter OR both start with non-letter, sort alphabetically
      return a.name.localeCompare(b.name);
    });
    this.applyFilters();
  }

  /**
   * Show loading state
   */
  showLoading() {
    const container = document.getElementById('lakes-list');
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-secondary">
          <div class="animate-pulse">Loading lakes...</div>
        </div>
      `;
    }
  }

  /**
   * Show error state
   */
  showError(message) {
    const container = document.getElementById('lakes-list');
    if (container) {
      container.innerHTML = `
        <div class="card text-center py-8">
          <p class="text-red-600 mb-2">⚠️ ${this.escapeHtml(message)}</p>
          <button onclick="location.reload()" class="btn-primary px-4 py-2 rounded-lg">Reload Page</button>
        </div>
      `;
    }
  }

  /**
   * Show empty state (no lakes in database)
   */
  showEmptyState() {
    const container = document.getElementById('lakes-list');
    if (container) {
      container.innerHTML = `
        <div class="card text-center py-8 text-secondary">
          <p>No lakes available.</p>
        </div>
      `;
    }
  }

  /**
   * Show empty filter state (no lakes match filters)
   */
  showEmptyFilterState() {
    const container = document.getElementById('lakes-list');
    if (container) {
      container.innerHTML = `
        <div class="card text-center py-8 text-secondary">
          <p class="mb-2">No lakes match your filters.</p>
          <button onclick="window.lakesList.clearFilters()" class="text-primary hover:underline text-sm">Clear Filters</button>
        </div>
      `;
    }
  }

  /**
   * Show loading indicator at bottom of list (for infinite scroll)
   */
  showLoadingMore() {
    const container = document.getElementById('lakes-list');
    if (container && !document.getElementById('loading-more')) {
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'loading-more';
      loadingDiv.className = 'text-center py-4 text-secondary text-sm';
      loadingDiv.innerHTML = '<div class="animate-pulse">Loading more lakes...</div>';
      container.appendChild(loadingDiv);
    }
  }

  /**
   * Remove loading indicator
   */
  removeLoadingMore() {
    const loadingDiv = document.getElementById('loading-more');
    if (loadingDiv) loadingDiv.remove();
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.lakesList = new LakesList();
  window.lakesList.init();
});
