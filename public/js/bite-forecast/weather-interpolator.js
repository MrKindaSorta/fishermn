/**
 * Weather Interpolator Module
 *
 * Converts 3-hour interval forecast data from OpenWeather API into hourly data
 * for precise bite score calculations. Uses multiple interpolation methods
 * depending on the data type.
 *
 * @module WeatherInterpolator
 */

const WeatherInterpolator = (() => {
  'use strict';

  /**
   * Linear interpolation between two values
   * Used for: temperature, pressure, humidity, clouds, wind speed, POP
   *
   * @param {number} val1 - Starting value
   * @param {number} val2 - Ending value
   * @param {number} steps - Number of steps (always 3 for 3-hour intervals)
   * @returns {number[]} Array of interpolated values including start and end
   */
  function interpolateLinear(val1, val2, steps) {
    if (val1 === undefined || val2 === undefined) {
      return Array(steps + 1).fill(val1 || val2 || 0);
    }

    const result = [];
    const increment = (val2 - val1) / steps;

    for (let i = 0; i <= steps; i++) {
      result.push(val1 + (increment * i));
    }

    return result;
  }

  /**
   * Circular interpolation for angles (wind direction)
   * Handles wrap-around correctly (e.g., 350° → 10° goes through 0°)
   *
   * @param {number} deg1 - Starting angle (0-360)
   * @param {number} deg2 - Ending angle (0-360)
   * @param {number} steps - Number of steps
   * @returns {number[]} Array of interpolated angles
   */
  function interpolateCircular(deg1, deg2, steps) {
    if (deg1 === undefined || deg2 === undefined) {
      return Array(steps + 1).fill(deg1 || deg2 || 0);
    }

    // Calculate shortest path around the circle
    let diff = deg2 - deg1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const result = [];
    const increment = diff / steps;

    for (let i = 0; i <= steps; i++) {
      let val = (deg1 + (increment * i)) % 360;
      if (val < 0) val += 360;
      result.push(val);
    }

    return result;
  }

  /**
   * Nearest neighbor selection for discrete values
   * Used for: weather conditions, weather icons
   *
   * @param {any} val1 - First value
   * @param {any} val2 - Second value
   * @param {number} steps - Number of steps
   * @returns {any[]} Array where first half gets val1, second half gets val2
   */
  function interpolateNearest(val1, val2, steps) {
    const result = [];
    const midpoint = steps / 2;

    for (let i = 0; i <= steps; i++) {
      result.push(i < midpoint ? val1 : val2);
    }

    return result;
  }

  /**
   * Even distribution for volume measurements
   * Used for: rain volume, snow volume
   *
   * @param {number} totalVolume - Total volume over 3-hour period
   * @param {number} steps - Number of steps
   * @returns {number[]} Array with volume evenly distributed
   */
  function distributeVolume(totalVolume, steps) {
    if (!totalVolume || totalVolume === 0) {
      return Array(steps + 1).fill(0);
    }

    const perHour = totalVolume / steps;
    return Array(steps + 1).fill(perHour);
  }

  /**
   * Safely extract nested property from object
   *
   * @param {object} obj - Object to extract from
   * @param {string} path - Dot-notation path (e.g., 'main.temp')
   * @param {any} defaultValue - Default if path doesn't exist
   * @returns {any} Value at path or default
   */
  function safeGet(obj, path, defaultValue = 0) {
    try {
      return path.split('.').reduce((current, key) => current[key], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Main interpolation function: converts 3-hour forecast to hourly data
   *
   * @param {Array} forecast3h - Array of 3-hour forecast points from OpenWeather API
   * @param {number} startTime - Unix timestamp (milliseconds) to start from
   * @returns {Array} Array of 24 hourly weather data objects
   */
  function expandForecastToHourly(forecast3h, startTime) {
    if (!forecast3h || forecast3h.length < 2) {
      console.error('[WeatherInterpolator] Insufficient forecast data');
      return [];
    }

    const hourlyData = [];
    const now = new Date(startTime);

    // We need at least 8 three-hour points to cover 24 hours
    const pointsNeeded = Math.min(8, forecast3h.length - 1);

    for (let i = 0; i < pointsNeeded; i++) {
      const current = forecast3h[i];
      const next = forecast3h[i + 1];

      // Extract values with safe defaults
      const currentTemp = safeGet(current, 'main.temp', 50);
      const nextTemp = safeGet(next, 'main.temp', 50);

      const currentPressure = safeGet(current, 'main.pressure', 1013);
      const nextPressure = safeGet(next, 'main.pressure', 1013);

      const currentHumidity = safeGet(current, 'main.humidity', 50);
      const nextHumidity = safeGet(next, 'main.humidity', 50);

      const currentClouds = safeGet(current, 'clouds.all', 50);
      const nextClouds = safeGet(next, 'clouds.all', 50);

      const currentWindSpeed = safeGet(current, 'wind.speed', 0);
      const nextWindSpeed = safeGet(next, 'wind.speed', 0);

      const currentWindDir = safeGet(current, 'wind.deg', 0);
      const nextWindDir = safeGet(next, 'wind.deg', 0);

      const currentPop = safeGet(current, 'pop', 0);
      const nextPop = safeGet(next, 'pop', 0);

      const currentRain = safeGet(current, 'rain.3h', 0);
      const currentSnow = safeGet(current, 'snow.3h', 0);

      // Interpolate all numeric values
      const tempValues = interpolateLinear(currentTemp, nextTemp, 3);
      const pressureValues = interpolateLinear(currentPressure, nextPressure, 3);
      const humidityValues = interpolateLinear(currentHumidity, nextHumidity, 3);
      const cloudValues = interpolateLinear(currentClouds, nextClouds, 3);
      const windSpeedValues = interpolateLinear(currentWindSpeed, nextWindSpeed, 3);
      const windDirValues = interpolateCircular(currentWindDir, nextWindDir, 3);
      const popValues = interpolateLinear(currentPop, nextPop, 3);

      // Discrete values use nearest neighbor
      const weatherValues = interpolateNearest(
        current.weather && current.weather[0] ? current.weather[0] : { main: 'Clear', description: 'Clear sky', icon: '01d' },
        next.weather && next.weather[0] ? next.weather[0] : { main: 'Clear', description: 'Clear sky', icon: '01d' },
        3
      );

      // Distribute precipitation evenly across 3 hours
      const rainValues = distributeVolume(currentRain, 3);
      const snowValues = distributeVolume(currentSnow, 3);

      // Create hourly entries (skip last index to avoid duplication with next segment)
      for (let h = 0; h < 3; h++) {
        const hourTimestamp = current.dt + (h * 3600); // Add hours in seconds

        hourlyData.push({
          dt: hourTimestamp,
          time: new Date(hourTimestamp * 1000),
          temp: Math.round(tempValues[h] * 10) / 10,
          pressure: Math.round(pressureValues[h] * 10) / 10,
          humidity: Math.round(humidityValues[h]),
          clouds: Math.round(cloudValues[h]),
          windSpeed: Math.round(windSpeedValues[h] * 10) / 10,
          windDir: Math.round(windDirValues[h]),
          pop: Math.round(popValues[h] * 100) / 100,
          weather: weatherValues[h],
          rain: Math.round(rainValues[h] * 100) / 100,
          snow: Math.round(snowValues[h] * 100) / 100
        });
      }
    }

    // Return exactly 24 hours worth of data
    return hourlyData.slice(0, 24);
  }

  /**
   * Public API
   */
  return {
    /**
     * Convert 3-hour forecast data to hourly data
     *
     * @param {Array} forecast3h - OpenWeather API forecast data (list array)
     * @param {number} startTime - Unix timestamp in milliseconds
     * @returns {Array} 24 hourly weather objects
     *
     * @example
     * const hourlyWeather = WeatherInterpolator.interpolate(
     *   forecastData.list,
     *   Date.now()
     * );
     */
    interpolate: expandForecastToHourly,

    /**
     * Utility: Linear interpolation (exposed for testing)
     */
    _interpolateLinear: interpolateLinear,

    /**
     * Utility: Circular interpolation (exposed for testing)
     */
    _interpolateCircular: interpolateCircular,

    /**
     * Utility: Nearest neighbor (exposed for testing)
     */
    _interpolateNearest: interpolateNearest,

    /**
     * Utility: Volume distribution (exposed for testing)
     */
    _distributeVolume: distributeVolume
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherInterpolator;
}
