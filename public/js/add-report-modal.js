/**
 * Add Report Modal Controller
 * Handles multi-step report submission (Ice, Catch, Snow)
 */

const AddReportModal = {
  // State
  currentStep: 1,
  selectedLake: null,
  selectedReportType: null,
  fishSpecies: null,
  searchTimeout: null,
  formData: {
    ice: { thickness: 12, condition: '', notes: '', onLake: false },
    catch: { species: '', count: 1, size: '', weight: '', depth: '', bait: '', notes: '', timing: null, catchDatetime: null },
    snow: { depth: 6, types: [], coverage: [], notes: '', onLake: false }
  },

  /**
   * Open modal
   */
  async open(reportType = null, lakeData = null) {
    // Check authentication
    if (typeof Auth === 'undefined' || !Auth.isAuthenticated()) {
      if (typeof AuthModal !== 'undefined') AuthModal.open();
      return;
    }

    const modal = document.getElementById('add-report-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Pre-select report type if provided
    this.selectedReportType = reportType;

    // Load fish species for catch reports
    if (!this.fishSpecies) {
      await this.loadFishSpecies();
    }

    // Pre-select lake if provided (skip step 1)
    if (lakeData) {
      this.selectedLake = lakeData;
      this.goToStep(2); // Skip lake selection, go to report type
      this.showLakeContext(lakeData);
    } else {
      this.goToStep(1); // Start with lake selection
      this.initLakeSearch();
      // Focus the lake search input
      setTimeout(() => {
        document.getElementById('lake-search-input')?.focus();
      }, 100);
    }
  },

  /**
   * Close modal
   */
  close() {
    const modal = document.getElementById('add-report-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    document.body.style.overflow = '';
    this.resetState();
  },

  /**
   * Show lake context when pre-selected
   */
  showLakeContext(lakeData) {
    // Update step 2 header to show the lake name
    const headerText = document.querySelector('#step-2 .text-sm.font-medium');
    if (headerText) {
      headerText.textContent = `Select Report Type for ${lakeData.name}`;
    }
  },

  /**
   * Reset modal state
   */
  resetState() {
    this.currentStep = 1;
    this.selectedLake = null;
    this.selectedReportType = null;
    this.formData = {
      ice: { thickness: 12, condition: '', notes: '', onLake: false },
      catch: { species: '', count: 1, size: '', weight: '', depth: '', bait: '', notes: '', timing: null, catchDatetime: null },
      snow: { depth: 6, types: [], coverage: [], notes: '', onLake: false }
    };

    // Clear inputs
    document.getElementById('lake-search-input').value = '';
    document.getElementById('lake-dropdown')?.classList.add('hidden');
    document.getElementById('selected-lake-display')?.classList.add('hidden');
    document.getElementById('error-message')?.classList.add('hidden');

    // Reset sliders
    document.getElementById('ice-thickness-slider').value = 12;
    document.getElementById('snow-depth-slider').value = 6;

    // Clear text inputs
    document.querySelectorAll('textarea, input[type="text"], input[type="number"], input[type="datetime-local"]').forEach(input => {
      if (input.id !== 'lake-search-input' && input.id !== 'fish-count') {
        input.value = '';
      }
    });

    // Reset fish count to 1
    const fishCountInput = document.getElementById('fish-count');
    if (fishCountInput) fishCountInput.value = 1;

    // Clear checkboxes
    const iceOnLake = document.getElementById('ice-on-lake');
    const snowOnLake = document.getElementById('snow-on-lake');
    if (iceOnLake) iceOnLake.checked = false;
    if (snowOnLake) snowOnLake.checked = false;

    // Reset timing buttons
    const nowBtn = document.getElementById('timing-now-btn');
    const earlierBtn = document.getElementById('timing-earlier-btn');
    const datetimeContainer = document.getElementById('earlier-datetime-container');

    nowBtn?.classList.remove('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
    nowBtn?.classList.add('border-grayPanel');
    earlierBtn?.classList.remove('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
    earlierBtn?.classList.add('border-grayPanel');
    datetimeContainer?.classList.add('hidden');

    // Reset snow buttons
    document.querySelectorAll('.snow-type-btn, .snow-coverage-btn').forEach(btn => {
      btn.classList.remove('bg-primary', 'text-white', 'border-primary');
      btn.classList.add('border-grayPanel');
    });
  },

  /**
   * Navigate to specific step
   */
  goToStep(step) {
    this.currentStep = step;

    // Hide all steps
    document.querySelectorAll('[id^="step-"]').forEach(el => {
      el.classList.add('hidden');
    });

    // Show current step
    if (step === 1) {
      document.getElementById('step-1')?.classList.remove('hidden');
    } else if (step === 2) {
      document.getElementById('step-2')?.classList.remove('hidden');
    } else if (step === 3) {
      // Show correct form based on report type
      if (this.selectedReportType === 'ice') {
        document.getElementById('step-3-ice')?.classList.remove('hidden');
      } else if (this.selectedReportType === 'catch') {
        document.getElementById('step-3-catch')?.classList.remove('hidden');
      } else if (this.selectedReportType === 'snow') {
        document.getElementById('step-3-snow')?.classList.remove('hidden');
      }
    }

    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.style.width = `${(step / 3) * 100}%`;
    }

    // Update step indicator
    const stepIndicator = document.getElementById('current-step');
    if (stepIndicator) {
      stepIndicator.textContent = step;
    }

    // Update buttons
    this.updateButtons();

    // Clear errors
    this.clearError();
  },

  /**
   * Update button visibility and text
   */
  updateButtons() {
    const backBtn = document.getElementById('btn-back');
    const nextBtn = document.getElementById('btn-next-submit');

    if (this.currentStep === 1) {
      backBtn?.classList.add('hidden');
      nextBtn.textContent = 'Next';
    } else if (this.currentStep === 2) {
      backBtn?.classList.remove('hidden');
      nextBtn.textContent = 'Next';
    } else if (this.currentStep === 3) {
      backBtn?.classList.remove('hidden');
      nextBtn.textContent = 'Submit Report';
    }
  },

  /**
   * Go to next step
   */
  nextStep() {
    if (!this.validateStep(this.currentStep)) return;

    if (this.currentStep < 3) {
      this.goToStep(this.currentStep + 1);
    } else {
      this.submitReport();
    }
  },

  /**
   * Go to previous step
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  /**
   * Validate current step
   */
  validateStep(step) {
    if (step === 1) {
      if (!this.selectedLake) {
        this.showError('Please select a lake');
        return false;
      }
    } else if (step === 2) {
      if (!this.selectedReportType) {
        this.showError('Please select a report type');
        return false;
      }
    } else if (step === 3) {
      // Type-specific validation
      if (this.selectedReportType === 'catch') {
        const species = document.getElementById('fish-species')?.value;
        if (!species) {
          this.showError('Please select a fish species');
          return false;
        }
        if (!this.formData.catch.timing) {
          this.showError('Please select when you caught the fish (Now or Earlier)');
          return false;
        }
      } else if (this.selectedReportType === 'snow') {
        if (this.formData.snow.types.length === 0) {
          this.showError('Please select at least one snow type');
          return false;
        }
        if (this.formData.snow.coverage.length === 0) {
          this.showError('Please select at least one coverage type');
          return false;
        }
      }
    }
    return true;
  },

  /**
   * Initialize lake search with debouncing
   */
  initLakeSearch() {
    const input = document.getElementById('lake-search-input');
    if (!input) return;

    input.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      const term = e.target.value.trim();

      if (!term) {
        document.getElementById('lake-dropdown')?.classList.add('hidden');
        return;
      }

      this.searchTimeout = setTimeout(() => {
        this.searchLakes(term);
      }, 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#lake-search-input') && !e.target.closest('#lake-dropdown')) {
        document.getElementById('lake-dropdown')?.classList.add('hidden');
      }
    });
  },

  /**
   * Search for lakes via API
   */
  async searchLakes(term) {
    const dropdown = document.getElementById('lake-dropdown');
    if (!dropdown) return;

    try {
      dropdown.innerHTML = '<div class="p-4 text-center text-secondary text-sm"><span class="inline-block animate-pulse">Searching...</span></div>';
      dropdown.classList.remove('hidden');

      const response = await fetch(`/api/lakes?search=${encodeURIComponent(term)}&limit=10`);
      const data = await response.json();

      this.renderDropdownResults(data.lakes || []);
    } catch (error) {
      console.error('Lake search error:', error);
      dropdown.innerHTML = '<div class="p-4 text-danger text-sm">Search failed. Try again.</div>';
    }
  },

  /**
   * Render lake search results
   */
  renderDropdownResults(lakes) {
    const dropdown = document.getElementById('lake-dropdown');
    if (!dropdown) return;

    if (lakes.length === 0) {
      dropdown.innerHTML = '<div class="p-4 text-secondary text-sm">No lakes found. Try a different name.</div>';
      dropdown.classList.remove('hidden');
      return;
    }

    dropdown.innerHTML = lakes.map(lake => `
      <div class="px-4 py-2 hover:bg-frost cursor-pointer border-b border-grayPanel/50 last:border-0"
           onclick="AddReportModal.selectLake('${lake.id}', '${lake.name.replace(/'/g, "\\'")}', '${lake.slug}')">
        <div class="font-medium text-primary text-sm">${lake.name}</div>
        <div class="text-xs text-secondary">${lake.region || 'Minnesota'}</div>
      </div>
    `).join('');
    dropdown.classList.remove('hidden');
  },

  /**
   * Select a lake
   */
  selectLake(id, name, slug) {
    this.selectedLake = { id, name, slug };

    const input = document.getElementById('lake-search-input');
    const dropdown = document.getElementById('lake-dropdown');
    const display = document.getElementById('selected-lake-display');
    const nameDisplay = document.getElementById('selected-lake-name');

    if (input) input.value = name;
    if (dropdown) dropdown.classList.add('hidden');
    if (display) display.classList.remove('hidden');
    if (nameDisplay) nameDisplay.textContent = name;

    this.clearError();
  },

  /**
   * Clear lake selection
   */
  clearLakeSelection() {
    this.selectedLake = null;

    const input = document.getElementById('lake-search-input');
    const display = document.getElementById('selected-lake-display');

    if (input) {
      input.value = '';
      input.focus();
    }
    if (display) display.classList.add('hidden');
  },

  /**
   * Load fish species from API
   */
  async loadFishSpecies() {
    try {
      const response = await fetch('/api/fish-species');
      const data = await response.json();

      if (data.success && data.species) {
        this.fishSpecies = data.species;
        this.populateFishSpeciesSelect();
      }
    } catch (error) {
      console.error('Error loading fish species:', error);
    }
  },

  /**
   * Populate fish species select dropdown
   */
  populateFishSpeciesSelect() {
    const select = document.getElementById('fish-species');
    if (!select || !this.fishSpecies) return;

    // Clear existing options except first
    select.innerHTML = '<option value="">-- Select a species --</option>';

    // Add optgroups in order
    const categoryOrder = ['Common', 'Sportfish', 'Rough Fish', 'Minnows & Baitfish'];

    categoryOrder.forEach(category => {
      if (this.fishSpecies[category] && this.fishSpecies[category].length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        this.fishSpecies[category].forEach(fish => {
          const option = document.createElement('option');
          option.value = fish.name;
          option.textContent = fish.name;
          optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
      }
    });
  },

  /**
   * Select report type
   */
  selectReportType(type) {
    this.selectedReportType = type;

    // Update card UI
    document.querySelectorAll('.report-type-card').forEach(card => {
      if (card.dataset.type === type) {
        card.classList.add('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
        card.classList.remove('border-grayPanel');
      } else {
        card.classList.remove('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
        card.classList.add('border-grayPanel');
      }
    });

    this.clearError();
  },

  /**
   * Update ice thickness display
   */
  updateIceDisplay(value) {
    const display = document.getElementById('ice-value');
    if (display) {
      display.textContent = value + '"';
    }
    this.formData.ice.thickness = parseFloat(value);
  },

  /**
   * Update snow depth display
   */
  updateSnowDisplay(value) {
    const display = document.getElementById('snow-value');
    if (display) {
      const displayValue = value >= 50 ? '48+"' : value + '"';
      display.textContent = displayValue;
    }
    this.formData.snow.depth = parseInt(value);
  },

  /**
   * Toggle snow type selection
   */
  toggleSnowType(type) {
    const btn = document.querySelector(`.snow-type-btn[data-type="${type}"]`);
    if (!btn) return;

    if (this.formData.snow.types.includes(type)) {
      // Remove
      this.formData.snow.types = this.formData.snow.types.filter(t => t !== type);
      btn.classList.remove('bg-primary', 'text-white', 'border-primary');
      btn.classList.add('border-grayPanel');
    } else {
      // Add
      this.formData.snow.types.push(type);
      btn.classList.add('bg-primary', 'text-white', 'border-primary');
      btn.classList.remove('border-grayPanel');
    }

    this.clearError();
  },

  /**
   * Toggle snow coverage selection
   */
  toggleSnowCoverage(coverage) {
    const btn = document.querySelector(`.snow-coverage-btn[data-coverage="${coverage}"]`);
    if (!btn) return;

    if (this.formData.snow.coverage.includes(coverage)) {
      // Remove
      this.formData.snow.coverage = this.formData.snow.coverage.filter(c => c !== coverage);
      btn.classList.remove('bg-primary', 'text-white', 'border-primary');
      btn.classList.add('border-grayPanel');
    } else {
      // Add
      this.formData.snow.coverage.push(coverage);
      btn.classList.add('bg-primary', 'text-white', 'border-primary');
      btn.classList.remove('border-grayPanel');
    }

    this.clearError();
  },

  /**
   * Select catch timing (now or earlier)
   */
  selectTiming(timing) {
    this.formData.catch.timing = timing;

    const nowBtn = document.getElementById('timing-now-btn');
    const earlierBtn = document.getElementById('timing-earlier-btn');
    const datetimeContainer = document.getElementById('earlier-datetime-container');

    if (timing === 'now') {
      nowBtn?.classList.add('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
      nowBtn?.classList.remove('border-grayPanel');
      earlierBtn?.classList.remove('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
      earlierBtn?.classList.add('border-grayPanel');
      datetimeContainer?.classList.add('hidden');
    } else if (timing === 'earlier') {
      earlierBtn?.classList.add('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
      earlierBtn?.classList.remove('border-grayPanel');
      nowBtn?.classList.remove('border-primary', 'bg-primary/5', 'ring-2', 'ring-primary');
      nowBtn?.classList.add('border-grayPanel');
      datetimeContainer?.classList.remove('hidden');
    }

    this.clearError();
  },

  /**
   * Submit report
   */
  async submitReport() {
    const token = localStorage.getItem('fishermn_auth_token');
    if (!token) {
      this.showError('Authentication required');
      return;
    }

    let endpoint, payload;

    // Build payload based on report type
    if (this.selectedReportType === 'ice') {
      endpoint = `/api/lakes/${this.selectedLake.slug}/ice-reports`;
      const onLake = document.getElementById('ice-on-lake')?.checked || false;

      payload = {
        thicknessInches: this.formData.ice.thickness,
        condition: document.getElementById('ice-condition')?.value || null,
        locationNotes: document.getElementById('ice-notes')?.value || null,
        onLake: onLake
      };
    } else if (this.selectedReportType === 'catch') {
      endpoint = `/api/lakes/${this.selectedLake.slug}/catch-reports`;
      const fishCount = parseInt(document.getElementById('fish-count')?.value);
      const fishSize = parseFloat(document.getElementById('fish-size')?.value);
      const fishWeight = parseFloat(document.getElementById('fish-weight')?.value);
      const fishDepth = parseFloat(document.getElementById('fish-depth')?.value);

      // Determine timing
      let caughtAt;
      let reportedLater = false;

      if (this.formData.catch.timing === 'now') {
        caughtAt = new Date().toISOString();
      } else if (this.formData.catch.timing === 'earlier') {
        const catchDatetimeInput = document.getElementById('catch-datetime')?.value;
        if (catchDatetimeInput) {
          caughtAt = new Date(catchDatetimeInput).toISOString();
        } else {
          caughtAt = new Date().toISOString();
          reportedLater = true;
        }
      }

      payload = {
        fishSpecies: document.getElementById('fish-species')?.value,
        fishCount: isNaN(fishCount) ? 1 : fishCount,
        largestSizeInches: isNaN(fishSize) ? null : fishSize,
        largestWeightLbs: isNaN(fishWeight) ? null : fishWeight,
        depthFeet: isNaN(fishDepth) ? null : fishDepth,
        baitUsed: document.getElementById('bait-used')?.value || null,
        locationNotes: document.getElementById('catch-notes')?.value || null,
        caughtAt: caughtAt,
        reportedLater: reportedLater
      };
    } else if (this.selectedReportType === 'snow') {
      endpoint = `/api/lakes/${this.selectedLake.slug}/snow-reports`;
      const onLake = document.getElementById('snow-on-lake')?.checked || false;

      payload = {
        thicknessInches: this.formData.snow.depth,
        snowType: this.formData.snow.types[0], // Take first selected type
        coverage: this.formData.snow.coverage[0], // Take first selected coverage
        locationNotes: document.getElementById('snow-notes')?.value || null,
        onLake: onLake
      };
    }

    // Disable submit button
    const submitBtn = document.getElementById('btn-next-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-pulse">Submitting...</span>';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        this.showSuccess('Report submitted successfully!');
        setTimeout(() => {
          this.close();
          // Emit event for page to refresh
          window.dispatchEvent(new CustomEvent('reportSubmitted', {
            detail: { lakeId: this.selectedLake.id, reportType: this.selectedReportType }
          }));
        }, 1500);
      } else {
        const error = await response.json();
        this.showError(error.message || 'Failed to submit report');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Report';
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.showError('Network error. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
      }
    }
  },

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');

      // Scroll to error
      errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  /**
   * Clear error message
   */
  clearError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.classList.add('hidden');
      errorDiv.textContent = '';
    }
  },

  /**
   * Show success message
   */
  showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.className = 'mx-6 mt-4 p-3 bg-evergreen/10 border border-evergreen/20 rounded-lg text-evergreen text-sm';
    }
  }
};

// Make globally available
window.AddReportModal = AddReportModal;
