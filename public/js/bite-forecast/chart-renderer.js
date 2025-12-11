/**
 * Chart Renderer Module
 *
 * Handles all Canvas-based visualization for the Bite Forecast:
 * - Main multi-species graph (400px height)
 * - Mini sparklines (64px height) for species cards
 * - NOW markers, gridlines, axes, labels
 *
 * @module ChartRenderer
 */

const ChartRenderer = (() => {
  'use strict';

  /**
   * Render main forecast chart showing 2-3 species
   *
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {object} speciesScores - { speciesId: [24 scores], ... }
   * @param {number} currentHour - Hour index for NOW marker (0-23)
   */
  function renderMainChart(canvas, speciesScores, currentHour) {
    if (!canvas) {
      console.error('[ChartRenderer] Canvas element not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[ChartRenderer] Could not get 2D context');
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    // Get parent container size
    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    // Set canvas size for retina displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Padding
    const padding = {
      top: 30,
      right: 120,  // Space for legend
      bottom: 50,
      left: 60
    };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid and axes
    drawGrid(ctx, padding, chartWidth, chartHeight);

    // Draw Y-axis (0-100 score scale)
    drawYAxis(ctx, padding, chartHeight);

    // Draw X-axis (time labels)
    drawXAxis(ctx, padding, chartWidth, chartHeight);

    // Draw each species line
    const speciesIds = Object.keys(speciesScores);
    speciesIds.forEach((speciesId, index) => {
      const profile = SpeciesProfiles.getProfile(speciesId);
      const scores = speciesScores[speciesId];

      drawSpeciesLine(
        ctx,
        scores,
        profile.color,
        padding,
        chartWidth,
        chartHeight
      );

      // Draw legend entry
      drawLegendEntry(
        ctx,
        profile,
        index,
        padding,
        width,
        chartHeight
      );
    });

    // Draw NOW marker
    drawNowMarker(ctx, currentHour, padding, chartWidth, chartHeight);
  }

  /**
   * Draw grid lines
   */
  function drawGrid(ctx, padding, chartWidth, chartHeight) {
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;

    // Horizontal gridlines (every 20 points)
    for (let score = 0; score <= 100; score += 20) {
      const y = padding.top + chartHeight - (score / 100) * chartHeight;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Vertical gridlines (every 3 hours)
    for (let hour = 0; hour <= 24; hour += 3) {
      const x = padding.left + (hour / 23) * chartWidth;

      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
  }

  /**
   * Draw Y-axis (score labels)
   */
  function drawYAxis(ctx, padding, chartHeight) {
    ctx.fillStyle = '#4B5563';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let score = 0; score <= 100; score += 20) {
      const y = padding.top + chartHeight - (score / 100) * chartHeight;

      ctx.fillText(score.toString(), padding.left - 10, y);
    }

    // Y-axis label
    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#0A3A60';
    ctx.fillText('Bite Score', 0, 0);
    ctx.restore();
  }

  /**
   * Draw X-axis (time labels)
   */
  function drawXAxis(ctx, padding, chartWidth, chartHeight) {
    ctx.fillStyle = '#4B5563';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const now = new Date();

    for (let hour = 0; hour <= 24; hour += 3) {
      const x = padding.left + (hour / 23) * chartWidth;

      // Calculate time for this hour
      const time = new Date(now);
      time.setHours(now.getHours() + hour, 0, 0, 0);

      const label = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      });

      ctx.fillText(label, x, padding.top + chartHeight + 10);

      // Tick mark
      ctx.strokeStyle = '#9CA3AF';
      ctx.beginPath();
      ctx.moveTo(x, padding.top + chartHeight);
      ctx.lineTo(x, padding.top + chartHeight + 5);
      ctx.stroke();
    }

    // X-axis label
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#0A3A60';
    ctx.fillText('Time', padding.left + chartWidth / 2, padding.top + chartHeight + 35);
  }

  /**
   * Draw species line on chart
   */
  function drawSpeciesLine(ctx, scores, color, padding, chartWidth, chartHeight) {
    if (!scores || scores.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    scores.forEach((scoreData, hour) => {
      const x = padding.left + (hour / 23) * chartWidth;
      const y = padding.top + chartHeight - (scoreData.score / 100) * chartHeight;

      if (hour === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  /**
   * Draw legend entry
   */
  function drawLegendEntry(ctx, profile, index, padding, width, chartHeight) {
    const legendX = width - padding.right + 15;
    const legendY = padding.top + index * 25;

    // Color indicator line
    ctx.strokeStyle = profile.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 25, legendY);
    ctx.stroke();

    // Species name
    ctx.fillStyle = '#0A3A60';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${profile.icon} ${profile.name}`, legendX + 30, legendY);
  }

  /**
   * Draw NOW marker (vertical line)
   */
  function drawNowMarker(ctx, currentHour, padding, chartWidth, chartHeight) {
    const x = padding.left + (currentHour / 23) * chartWidth;

    // Vertical dashed line
    ctx.strokeStyle = '#D9534F';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, padding.top + chartHeight);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // "NOW" label
    ctx.fillStyle = '#D9534F';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NOW', x, padding.top - 10);
  }

  /**
   * Render sparkline (mini 24h preview)
   *
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Array} scores - 24 hourly scores
   * @param {number} currentHour - Hour index for NOW marker
   */
  function renderSparkline(canvas, scores, currentHour) {
    if (!canvas || !scores) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Get canvas size from parent or attributes
    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight || 64;

    // Set canvas dimensions
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Extract scores
    const scoreValues = scores.map(s => s.score);
    const min = 0;
    const max = 100;

    // Draw line
    ctx.strokeStyle = '#0A3A60';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    scoreValues.forEach((score, hour) => {
      const x = (hour / 23) * width;
      const y = height - ((score - min) / (max - min)) * height;

      if (hour === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area under curve with gradient
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(10, 58, 96, 0.2)');
    gradient.addColorStop(1, 'rgba(10, 58, 96, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw NOW marker
    const nowX = (currentHour / 23) * width;
    ctx.strokeStyle = '#D9534F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nowX, 0);
    ctx.lineTo(nowX, height);
    ctx.stroke();
  }

  /**
   * Render detail chart (expanded view, taller than sparkline)
   *
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Array} scores - 24 hourly scores
   */
  function renderDetailChart(canvas, scores) {
    if (!canvas || !scores) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Get parent size
    const parent = canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight || 128;

    // Set canvas dimensions
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const padding = { top: 10, right: 10, bottom: 25, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw Y-axis gridlines and labels
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let score = 0; score <= 100; score += 25) {
      const y = padding.top + chartHeight - (score / 100) * chartHeight;

      // Gridline
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Label
      ctx.fillText(score.toString(), padding.left - 5, y);
    }

    // Draw X-axis time labels
    const now = new Date();
    ctx.fillStyle = '#6B7280';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';

    [0, 6, 12, 18, 24].forEach(hour => {
      const x = padding.left + (hour / 23) * chartWidth;
      const time = new Date(now);
      time.setHours(now.getHours() + hour, 0, 0, 0);

      const label = time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      });

      ctx.fillText(label, x, padding.top + chartHeight + 15);
    });

    // Draw score line
    const scoreValues = scores.map(s => s.score);

    ctx.strokeStyle = '#0A3A60';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();

    scoreValues.forEach((score, hour) => {
      const x = padding.left + (hour / 23) * chartWidth;
      const y = padding.top + chartHeight - (score / 100) * chartHeight;

      if (hour === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Fill area
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(10, 58, 96, 0.15)');
    gradient.addColorStop(1, 'rgba(10, 58, 96, 0.02)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  /**
   * Public API
   */
  return {
    /**
     * Render main multi-species chart
     */
    renderMainChart,

    /**
     * Render sparkline (mini preview)
     */
    renderSparkline,

    /**
     * Render detail chart (expanded view)
     */
    renderDetailChart
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartRenderer;
}

// Make available globally
window.ChartRenderer = ChartRenderer;
