/**
 * Chart Renderer Module (Chart.js Implementation)
 *
 * Handles all interactive chart visualization using Chart.js:
 * - Main multi-species graph with hover tooltips
 * - Mini sparklines for species cards
 * - Interactive features: hover, click, zoom
 *
 * @module ChartRenderer
 */

const ChartRenderer = (() => {
  'use strict';

  // Store chart instances for updates/destruction
  const chartInstances = {
    main: null,
    sparklines: {}
  };

  /**
   * Get quality color for a score
   */
  function getQualityColor(score) {
    if (score >= 80) return '#22c55e'; // Excellent - Green
    if (score >= 60) return '#D4AF37'; // Good - Gold
    if (score >= 40) return '#FFA500'; // Fair - Orange
    if (score >= 20) return '#FF8C00'; // Poor - Dark Orange
    return '#D9534F'; // Very Poor - Red
  }

  /**
   * Get quality label for a score
   */
  function getQualityLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Render main forecast chart with Chart.js (interactive)
   *
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {object} speciesScores - { speciesId: [scores], ... }
   * @param {number} currentHour - Hour index for NOW marker (0-23)
   * @param {string} view - '24h' or '5day'
   */
  function renderMainChart(canvas, speciesScores, currentHour, view = '24h') {
    console.log('[ChartRenderer] renderMainChart called with Chart.js', { speciesScores, currentHour, view });

    if (!canvas) {
      console.error('[ChartRenderer] Canvas element not found');
      return;
    }

    // Destroy existing chart if it exists
    if (chartInstances.main) {
      chartInstances.main.destroy();
    }

    // Prepare datasets for each species
    const datasets = [];
    const now = new Date();

    Object.keys(speciesScores).forEach(speciesId => {
      const profile = SpeciesProfiles.getProfile(speciesId);
      const scores = speciesScores[speciesId];

      datasets.push({
        label: profile.name,
        data: scores.map(s => s.score),
        borderColor: profile.color,
        backgroundColor: profile.color + '20', // 20 = 12% opacity
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: profile.color,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        tension: 0.4, // Smooth curves
        fill: false
      });
    });

    // Create time labels based on view
    const labels = [];
    const firstScores = Object.values(speciesScores)[0];

    if (firstScores && firstScores.length > 0) {
      firstScores.forEach(score => {
        labels.push(score.time);
      });
    } else {
      // Fallback for 24h view
      for (let hour = 0; hour < 24; hour++) {
        const time = new Date(now);
        time.setHours(now.getHours() + hour, 0, 0, 0);
        labels.push(time);
      }
    }

    // Create Chart.js configuration
    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                family: 'Inter, sans-serif',
                size: 12
              }
            }
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
              family: 'Inter, sans-serif',
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              family: 'Inter, sans-serif',
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              title: function(tooltipItems) {
                const time = tooltipItems[0].label;
                const date = new Date(time);
                return date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              },
              label: function(context) {
                const score = context.parsed.y;
                const quality = getQualityLabel(score);
                return `${context.dataset.label}: ${score} (${quality})`;
              },
              afterLabel: function(context) {
                const hour = context.dataIndex;
                const speciesId = Object.keys(speciesScores)[context.datasetIndex];
                const scoreData = speciesScores[speciesId][hour];

                if (scoreData.factors && scoreData.factors.length > 0) {
                  const topFactor = scoreData.factors[0];
                  return `\n${topFactor.description}`;
                }
                return '';
              }
            }
          },
          annotation: {
            annotations: {
              nowLine: {
                type: 'line',
                xMin: currentHour,
                xMax: currentHour,
                borderColor: '#D9534F',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: 'NOW',
                  position: 'start',
                  backgroundColor: '#D9534F',
                  color: '#fff',
                  font: {
                    weight: 'bold',
                    size: 11
                  }
                }
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time',
              font: {
                family: 'Inter, sans-serif',
                size: 14,
                weight: 'bold'
              },
              color: '#0A3A60'
            },
            ticks: {
              callback: function(value, index) {
                const time = new Date(labels[index]);

                if (view === '24h') {
                  // 24h view: show all hours
                  return time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                  });
                } else {
                  // 5day view: show date + time every 8th point (once per day)
                  if (index % 8 === 0) {
                    return time.toLocaleDateString('en-US', { weekday: 'short' }) + ' ' +
                           time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  }
                  // Show time for noon and midnight
                  const hours = time.getHours();
                  if (hours === 0 || hours === 12) {
                    return time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
                  }
                  return '';
                }
              },
              font: {
                family: 'Inter, sans-serif',
                size: view === '24h' ? 10 : 9
              },
              color: '#4B5563',
              maxRotation: view === '24h' ? 45 : 45,
              minRotation: view === '24h' ? 45 : 0
            },
            grid: {
              color: '#E5E7EB',
              drawTicks: true
            }
          },
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Bite Score',
              font: {
                family: 'Inter, sans-serif',
                size: 14,
                weight: 'bold'
              },
              color: '#0A3A60'
            },
            ticks: {
              stepSize: 20,
              font: {
                family: 'Inter, sans-serif',
                size: 11
              },
              color: '#4B5563'
            },
            grid: {
              color: '#E5E7EB'
            }
          }
        }
      }
    };

    // Create chart
    console.log('[ChartRenderer] Creating Chart.js instance...');
    chartInstances.main = new Chart(canvas, config);
    console.log('[ChartRenderer] Chart.js instance created');
  }

  /**
   * Render sparkline with Chart.js (mini preview)
   *
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Array} scores - 24 hourly scores
   * @param {number} currentHour - Hour index for NOW marker
   */
  function renderSparkline(canvas, scores, currentHour) {
    if (!canvas || !scores) {
      console.warn('[ChartRenderer] renderSparkline: missing canvas or scores');
      return;
    }

    const speciesId = canvas.dataset.species;
    console.log('[ChartRenderer] renderSparkline for', speciesId);

    // Destroy existing chart if it exists
    if (chartInstances.sparklines[speciesId]) {
      chartInstances.sparklines[speciesId].destroy();
    }

    const profile = SpeciesProfiles.getProfile(speciesId);

    // Prepare data
    const data = scores.map(s => s.score);
    const labels = scores.map((s, i) => i);

    // Create sparkline chart configuration
    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: profile.color,
          backgroundColor: profile.color + '20',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 8,
            cornerRadius: 6,
            displayColors: false,
            callbacks: {
              title: function(tooltipItems) {
                const now = new Date();
                const time = new Date(now);
                time.setHours(now.getHours() + tooltipItems[0].dataIndex, 0, 0, 0);
                return time.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  hour12: true
                });
              },
              label: function(context) {
                const score = context.parsed.y;
                const quality = getQualityLabel(score);
                return `Score: ${score} (${quality})`;
              }
            }
          }
        },
        scales: {
          x: {
            display: false
          },
          y: {
            display: false,
            min: 0,
            max: 100
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        }
      }
    };

    // Create sparkline chart
    chartInstances.sparklines[speciesId] = new Chart(canvas, config);
  }

  /**
   * Render detail chart (expanded view - same as sparkline but taller)
   */
  function renderDetailChart(canvas, scores) {
    if (!canvas || !scores) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const speciesId = canvas.dataset.species;
    const profile = SpeciesProfiles.getProfile(speciesId);

    // Similar to sparkline but with axes visible
    const data = scores.map(s => s.score);
    const now = new Date();
    const labels = scores.map((s, i) => {
      const time = new Date(now);
      time.setHours(now.getHours() + i, 0, 0, 0);
      return time;
    });

    const config = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          borderColor: profile.color,
          backgroundColor: profile.color + '15',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              title: function(tooltipItems) {
                const time = tooltipItems[0].label;
                return new Date(time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                });
              },
              label: function(context) {
                const score = context.parsed.y;
                const quality = getQualityLabel(score);
                return `Score: ${score} (${quality})`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            ticks: {
              callback: function(value, index) {
                if (index % 6 === 0) {
                  const time = new Date(labels[index]);
                  return time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                  });
                }
                return '';
              },
              font: { size: 9 }
            },
            grid: { display: false }
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 25,
              font: { size: 9 }
            },
            grid: {
              color: '#E5E7EB'
            }
          }
        }
      }
    };

    new Chart(canvas, config);
  }

  /**
   * Destroy all chart instances (cleanup)
   */
  function destroyAll() {
    if (chartInstances.main) {
      chartInstances.main.destroy();
      chartInstances.main = null;
    }

    Object.keys(chartInstances.sparklines).forEach(key => {
      if (chartInstances.sparklines[key]) {
        chartInstances.sparklines[key].destroy();
      }
    });

    chartInstances.sparklines = {};
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
    renderDetailChart,

    /**
     * Destroy all charts (cleanup)
     */
    destroyAll,

    /**
     * Get chart instances (for debugging)
     */
    getInstances: () => chartInstances
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartRenderer;
}

// Make available globally
window.ChartRenderer = ChartRenderer;
