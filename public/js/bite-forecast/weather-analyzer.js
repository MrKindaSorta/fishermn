/**
 * Weather Analyzer Module
 *
 * Analyzes weather patterns and trends to identify key events that affect fish feeding:
 * - Pressure trends (falling/rising/stable)
 * - Storm phases (pre-storm, active, post-storm)
 * - Temperature trends (cold fronts, warming spells, extreme cold)
 * - Sunrise/sunset times for time-of-day calculations
 *
 * @module WeatherAnalyzer
 */

const WeatherAnalyzer = (() => {
  'use strict';

  // Thresholds from BiteForecastMatrix.md
  const THRESHOLDS = {
    pressure: {
      fallingFast: -1.5,      // mb change over 3 hours
      falling: -0.5,
      risingFast: 1.5,
      rising: 0.5,
      low: 1010,              // hPa absolute value
      high: 1033
    },
    temperature: {
      extremeCold: 10,        // °F threshold
      coldFrontDrop: 15,      // °F drop indicating cold front
      warmingBonus: 5         // °F increase for warming trend
    },
    precipitation: {
      highPOP: 0.5,           // 50% probability
      lightSnow: 1,           // mm/3h
      heavySnow: 5
    }
  };

  /**
   * Analyze pressure trend at given hour
   *
   * @param {Array} hourlyWeather - 24 hours of weather data
   * @param {number} hour - Hour index (0-23)
   * @returns {object} Trend info: { trend, score, description }
   */
  function analyzePressureTrend(hourlyWeather, hour) {
    if (!hourlyWeather || hour < 0 || hour >= hourlyWeather.length) {
      return { trend: 'unknown', score: 0, description: 'Pressure data unavailable' };
    }

    const current = hourlyWeather[hour];
    const currentPressure = current.pressure;

    // Compare to 3 hours prior (or use current if not available)
    const priorHour = Math.max(0, hour - 3);
    const priorPressure = hourlyWeather[priorHour].pressure;

    const change = currentPressure - priorPressure;
    const changeRate = hour >= 3 ? change / 3 : 0; // mb per hour

    // Determine trend based on change magnitude
    if (change < THRESHOLDS.pressure.fallingFast) {
      return {
        trend: 'falling_fast',
        score: +12,
        description: 'Pressure dropping rapidly before storm - excellent feeding trigger'
      };
    }

    if (change < THRESHOLDS.pressure.falling) {
      return {
        trend: 'falling',
        score: +8,
        description: 'Pressure falling steadily - fish becoming more active'
      };
    }

    if (change > THRESHOLDS.pressure.risingFast) {
      return {
        trend: 'rising_fast',
        score: -10,
        description: 'Sharp pressure spike - post-storm lockjaw'
      };
    }

    if (change > THRESHOLDS.pressure.rising) {
      return {
        trend: 'rising',
        score: -5,
        description: 'Pressure rising after front - fish slowing down'
      };
    }

    // Check absolute pressure for additional context
    if (currentPressure < THRESHOLDS.pressure.low) {
      return {
        trend: 'low_steady',
        score: +5,
        description: 'Low, stable pressure - favorable conditions'
      };
    }

    if (currentPressure > THRESHOLDS.pressure.high) {
      return {
        trend: 'high',
        score: -10,
        description: 'Extreme high pressure - fish uncomfortable and inactive'
      };
    }

    return {
      trend: 'stable',
      score: 0,
      description: 'Stable pressure - normal activity'
    };
  }

  /**
   * Detect storm events across 24-hour forecast
   *
   * @param {Array} hourlyWeather - 24 hours of weather data
   * @returns {Array} Array of storm events with hour, type, score, description
   */
  function detectStormEvents(hourlyWeather) {
    if (!hourlyWeather || hourlyWeather.length < 3) {
      return [];
    }

    const events = [];

    for (let i = 0; i < hourlyWeather.length; i++) {
      const h = hourlyWeather[i];
      const prevHour = i > 0 ? hourlyWeather[i - 1] : h;

      // Pre-storm detection: High POP ahead + falling pressure
      if (h.pop > THRESHOLDS.precipitation.highPOP) {
        const pressureTrend = analyzePressureTrend(hourlyWeather, i);

        if (pressureTrend.trend === 'falling_fast' || pressureTrend.trend === 'falling') {
          // Check if precipitation hasn't started yet (pre-storm window)
          if (h.rain < 0.5 && h.snow < 0.5) {
            events.push({
              hour: i,
              type: 'pre_storm',
              score: +15,
              description: 'Storm approaching - fish feeding actively before arrival'
            });
          }
        }
      }

      // Active storm: Significant precipitation occurring
      if (h.rain > THRESHOLDS.precipitation.lightSnow || h.snow > THRESHOLDS.precipitation.lightSnow) {
        const intensity = (h.rain > THRESHOLDS.precipitation.heavySnow || h.snow > THRESHOLDS.precipitation.heavySnow)
          ? 'heavy'
          : 'light';

        events.push({
          hour: i,
          type: 'storm_active',
          score: intensity === 'heavy' ? -5 : +2,
          description: intensity === 'heavy'
            ? 'Heavy precipitation - possible mid-storm slowdown'
            : 'Light precipitation occurring - good low-light conditions'
        });
      }

      // Post-storm detection: Precipitation stopped + pressure rising
      if (i > 0 &&
          h.pop < 0.2 &&
          prevHour.pop > THRESHOLDS.precipitation.highPOP &&
          h.rain < 0.5 && h.snow < 0.5) {

        const pressureTrend = analyzePressureTrend(hourlyWeather, i);

        if (pressureTrend.trend === 'rising_fast' || pressureTrend.trend === 'rising') {
          events.push({
            hour: i,
            type: 'post_storm',
            score: -15,
            description: 'Post-storm high pressure - poor bite for next 12-24 hours'
          });
        }
      }
    }

    return events;
  }

  /**
   * Analyze temperature trends
   *
   * @param {Array} hourlyWeather - 24 hours of weather data
   * @param {number} hour - Hour index
   * @returns {object} Temperature trend info: { trend, score, description }
   */
  function analyzeTemperatureTrend(hourlyWeather, hour) {
    if (!hourlyWeather || hour < 0 || hour >= hourlyWeather.length) {
      return { trend: 'unknown', score: 0, description: 'Temperature data unavailable' };
    }

    const current = hourlyWeather[hour];
    const currentTemp = current.temp;

    // Extreme cold detection
    if (currentTemp < THRESHOLDS.temperature.extremeCold) {
      return {
        trend: 'extreme_cold',
        score: -10,
        description: 'Extreme cold - fish metabolism greatly reduced'
      };
    }

    // Check for warming trend (compare to 6 hours ago)
    if (hour >= 6) {
      const sixHoursAgo = hourlyWeather[hour - 6].temp;
      const tempChange = currentTemp - sixHoursAgo;

      if (tempChange >= THRESHOLDS.temperature.warmingBonus) {
        return {
          trend: 'warming',
          score: +5,
          description: `Warming trend (+${Math.round(tempChange)}°F) - fish becoming more active`
        };
      }

      // Cold front detection (rapid temperature drop)
      if (tempChange <= -THRESHOLDS.temperature.coldFrontDrop) {
        return {
          trend: 'cold_front',
          score: -10,
          description: `Cold front passing (${Math.round(tempChange)}°F drop) - bite deteriorating`
        };
      }
    }

    // Mild temperatures (relative to winter)
    if (currentTemp >= 15 && currentTemp <= 32) {
      return {
        trend: 'mild',
        score: +3,
        description: 'Mild winter temperatures - fish comfortable'
      };
    }

    return {
      trend: 'stable',
      score: 0,
      description: 'Normal winter temperatures'
    };
  }

  /**
   * Calculate sunrise and sunset times for a location and date
   * Uses simplified solar calculation (accurate within ~5 minutes)
   *
   * @param {number} lat - Latitude in degrees
   * @param {number} lon - Longitude in degrees
   * @param {Date} date - Date to calculate for
   * @returns {object} { sunrise: Date, sunset: Date }
   */
  function calculateSunTimes(lat, lon, date) {
    // Julian day calculation
    const julianDay = (date.getTime() / 86400000) + 2440587.5;
    const n = julianDay - 2451545.0 + 0.0008;

    // Mean solar noon
    const J_ = n - lon / 360;

    // Solar mean anomaly
    const M = (357.5291 + 0.98560028 * J_) % 360;
    const Mrad = M * Math.PI / 180;

    // Equation of center
    const C = 1.9148 * Math.sin(Mrad) + 0.0200 * Math.sin(2 * Mrad) + 0.0003 * Math.sin(3 * Mrad);

    // Ecliptic longitude
    const lambda = (M + C + 180 + 102.9372) % 360;
    const lambdaRad = lambda * Math.PI / 180;

    // Solar transit
    const Jtransit = 2451545.0 + J_ + 0.0053 * Math.sin(Mrad) - 0.0069 * Math.sin(2 * lambdaRad);

    // Declination
    const delta = Math.asin(Math.sin(lambdaRad) * Math.sin(23.44 * Math.PI / 180));

    // Hour angle (for sunrise/sunset at -0.83° below horizon)
    const latRad = lat * Math.PI / 180;
    const cosOmega = (Math.sin(-0.833 * Math.PI / 180) - Math.sin(latRad) * Math.sin(delta)) /
                     (Math.cos(latRad) * Math.cos(delta));

    // Check if sun rises/sets (polar day/night check)
    if (cosOmega > 1 || cosOmega < -1) {
      // Polar day or polar night - return noon and midnight
      const noon = new Date(date);
      noon.setHours(12, 0, 0, 0);
      return { sunrise: noon, sunset: noon };
    }

    const omega = Math.acos(cosOmega) * 180 / Math.PI;

    // Sunrise and sunset Julian days
    const Jrise = Jtransit - omega / 360;
    const Jset = Jtransit + omega / 360;

    // Convert to Date objects
    const sunrise = new Date((Jrise - 2440587.5) * 86400000);
    const sunset = new Date((Jset - 2440587.5) * 86400000);

    return { sunrise, sunset };
  }

  /**
   * Get time-of-day period for an hour relative to sunrise/sunset
   *
   * @param {number} hour - Hour index (0-23)
   * @param {Date} hourTime - Actual time of the hour
   * @param {object} sunTimes - { sunrise: Date, sunset: Date }
   * @returns {string} Period: 'dawn', 'day', 'dusk', 'night'
   */
  function getTimeOfDayPeriod(hour, hourTime, sunTimes) {
    const hourMs = hourTime.getTime();
    const sunriseMs = sunTimes.sunrise.getTime();
    const sunsetMs = sunTimes.sunset.getTime();

    const minutesFromSunrise = (hourMs - sunriseMs) / 60000;
    const minutesFromSunset = (hourMs - sunsetMs) / 60000;

    // Dawn: 90 minutes before to 45 minutes after sunrise
    if (minutesFromSunrise >= -90 && minutesFromSunrise <= 45) {
      return 'dawn';
    }

    // Dusk: 45 minutes before to 90 minutes after sunset
    if (minutesFromSunset >= -45 && minutesFromSunset <= 90) {
      return 'dusk';
    }

    // Day: After dawn, before dusk
    if (hourMs > sunriseMs + 45 * 60000 && hourMs < sunsetMs - 45 * 60000) {
      return 'day';
    }

    // Night: After dusk, before dawn
    return 'night';
  }

  /**
   * Public API
   */
  return {
    /**
     * Analyze pressure trend for specific hour
     */
    analyzePressureTrend,

    /**
     * Detect all storm events in 24-hour forecast
     */
    detectStormEvents,

    /**
     * Analyze temperature trend
     */
    analyzeTemperatureTrend,

    /**
     * Calculate sunrise and sunset times
     */
    calculateSunTimes,

    /**
     * Get time-of-day period (dawn/day/dusk/night)
     */
    getTimeOfDayPeriod,

    /**
     * Expose thresholds for external use
     */
    THRESHOLDS
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherAnalyzer;
}
