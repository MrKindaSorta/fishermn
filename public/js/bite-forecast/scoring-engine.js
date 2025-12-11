/**
 * Scoring Engine Module
 *
 * Core bite score calculation algorithm implementing the BiteForecastMatrix.md
 * scoring system. Calculates 0-100 bite scores for each species at each hour
 * based on:
 * - Time of day (species-specific patterns)
 * - Weather factors (pressure, temp, clouds, precip, wind)
 * - Historical context (multi-day trends)
 *
 * @module ScoringEngine
 */

const ScoringEngine = (() => {
  'use strict';

  /**
   * Get quality label and color for a score
   *
   * @param {number} score - Bite score (0-100)
   * @returns {object} { label, color }
   */
  function getQualityLabel(score) {
    if (score >= 80) return { label: 'Excellent', color: '#22c55e' };
    if (score >= 60) return { label: 'Good', color: '#D4AF37' };
    if (score >= 40) return { label: 'Fair', color: '#FFA500' };
    if (score >= 20) return { label: 'Poor', color: '#FF8C00' };
    return { label: 'Very Poor', color: '#D9534F' };
  }

  /**
   * Calculate time-of-day modifier for a species at given hour
   *
   * @param {object} profile - Species profile from SpeciesProfiles
   * @param {number} hour - Hour index (0-23)
   * @param {Date} hourTime - Actual time of the hour
   * @param {object} sunTimes - { sunrise: Date, sunset: Date }
   * @returns {object} { value, description, period }
   */
  function getTimeOfDayModifier(profile, hour, hourTime, sunTimes) {
    const patterns = profile.timePatterns;
    const period = WeatherAnalyzer.getTimeOfDayPeriod(hour, hourTime, sunTimes);

    // Check for dawn period
    if (period === 'dawn' && patterns.dawn) {
      return {
        value: patterns.dawn.modifier,
        description: `Dawn feeding peak - ${profile.name} have hunting advantage in low light`,
        period: 'dawn'
      };
    }

    // Check for dusk period
    if (period === 'dusk' && patterns.dusk) {
      return {
        value: patterns.dusk.modifier,
        description: `Dusk feeding peak - prime time for ${profile.name}`,
        period: 'dusk'
      };
    }

    // Check for early night (hours after sunset)
    if (period === 'night' && patterns.earlyNight) {
      const hoursSinceSunset = (hourTime - sunTimes.sunset) / 3600000;
      if (hoursSinceSunset >= 0 && hoursSinceSunset <= (patterns.earlyNight.hoursAfterSunset || 3)) {
        return {
          value: patterns.earlyNight.modifier,
          description: `Early night feeding - ${profile.name} active after dark`,
          period: 'early_night'
        };
      }

      // Late night
      if (patterns.lateNight) {
        return {
          value: patterns.lateNight.modifier,
          description: patterns.lateNight.modifier < 0 ? `Late night - ${profile.name} not active` : `Late night feeding period`,
          period: 'late_night'
        };
      }
    }

    // Check for midday
    if (period === 'day' && patterns.midday) {
      return {
        value: patterns.midday.modifier,
        description: patterns.midday.modifier < 0
          ? `Bright midday - ${profile.name} less active`
          : `Midday feeding - ${profile.name} active during daylight`,
        period: 'midday'
      };
    }

    // Check for specific time-based patterns (morning, afternoon, etc.)
    if (patterns.morning) {
      const hoursSinceSunrise = (hourTime - sunTimes.sunrise) / 3600000;
      if (hoursSinceSunrise >= 0 && hoursSinceSunrise <= (patterns.morning.hoursAfterSunrise || 3)) {
        return {
          value: patterns.morning.modifier,
          description: `Morning feeding period - ${profile.name} actively foraging`,
          period: 'morning'
        };
      }
    }

    if (patterns.afternoon) {
      const hoursUntilSunset = (sunTimes.sunset - hourTime) / 3600000;
      if (hoursUntilSunset >= 0 && hoursUntilSunset <= (patterns.afternoon.hoursBeforeSunset || 3)) {
        return {
          value: patterns.afternoon.modifier,
          description: `Afternoon feeding - ${profile.name} feeding before evening`,
          period: 'afternoon'
        };
      }
    }

    if (patterns.lateAfternoon) {
      const hoursUntilSunset = (sunTimes.sunset - hourTime) / 3600000;
      if (hoursUntilSunset >= 0 && hoursUntilSunset <= (patterns.lateAfternoon.hoursBeforeSunset || 3)) {
        return {
          value: patterns.lateAfternoon.modifier,
          description: `Late afternoon - good time for ${profile.name}`,
          period: 'late_afternoon'
        };
      }
    }

    // Default to neutral
    return {
      value: 0,
      description: 'Normal activity period',
      period: period
    };
  }

  /**
   * Calculate cloud cover impact for species
   *
   * @param {object} weather - Hourly weather data
   * @param {object} profile - Species profile
   * @param {string} timePeriod - Current time period (dawn/day/dusk/night)
   * @returns {object} { value, description }
   */
  function analyzeCloudCover(weather, profile, timePeriod) {
    const cloudPct = weather.clouds;
    const prefs = profile.cloudPreference;

    // Overcast (70-100% clouds)
    if (cloudPct >= 70 && prefs.overcast) {
      const modifier = prefs.overcast * profile.weatherWeights.cloudCover;
      return {
        value: modifier,
        description: modifier > 0
          ? 'Overcast skies extending feeding window - low light conditions favored'
          : 'Heavy cloud cover'
      };
    }

    // Clear skies (0-30% clouds) - mainly affects predators at midday
    if (cloudPct <= 30 && prefs.clear && timePeriod === 'midday') {
      const modifier = prefs.clear * profile.weatherWeights.cloudCover;
      return {
        value: modifier,
        description: modifier < 0
          ? 'Clear bright skies - fish may be light-shy at midday'
          : 'Clear skies - good visibility for hunting'
      };
    }

    // Partly cloudy - neutral
    return {
      value: 0,
      description: 'Moderate cloud cover - neutral conditions'
    };
  }

  /**
   * Calculate temperature impact
   *
   * @param {object} weather - Hourly weather data
   * @param {object} profile - Species profile
   * @param {Array} hourlyWeather - All 24 hours (for trend detection)
   * @param {number} hour - Current hour index
   * @returns {object} { value, description }
   */
  function analyzeTempFactor(weather, profile, hourlyWeather, hour) {
    const tempTrend = WeatherAnalyzer.analyzeTemperatureTrend(hourlyWeather, hour);
    const modifier = tempTrend.score * profile.weatherWeights.temperature;

    if (Math.abs(modifier) > 2) {
      return {
        value: modifier,
        description: tempTrend.description
      };
    }

    return {
      value: 0,
      description: 'Normal temperatures for season'
    };
  }

  /**
   * Analyze storm/precipitation impact
   *
   * @param {number} hour - Current hour
   * @param {Array} stormEvents - Storm events from WeatherAnalyzer
   * @param {object} profile - Species profile
   * @returns {object} { value, description }
   */
  function analyzeStormImpact(hour, stormEvents, profile) {
    // Find any storm events affecting this hour
    const events = stormEvents.filter(e => e.hour === hour);

    if (events.length === 0) {
      return { value: 0, description: null };
    }

    // Take the most impactful event
    const primaryEvent = events.reduce((prev, curr) =>
      Math.abs(curr.score) > Math.abs(prev.score) ? curr : prev
    );

    const modifier = primaryEvent.score * profile.weatherWeights.precipitation;

    return {
      value: modifier,
      description: primaryEvent.description
    };
  }

  /**
   * Analyze wind impact
   *
   * @param {object} weather - Hourly weather data
   * @param {object} profile - Species profile
   * @returns {object} { value, description }
   */
  function analyzeWindFactor(weather, profile) {
    const windSpeed = weather.windSpeed;

    // Strong gusts (>30 mph) - negative impact
    if (windSpeed > 30) {
      const modifier = -5 * profile.weatherWeights.wind;
      return {
        value: modifier,
        description: 'Strong winds creating noise and vibration through ice'
      };
    }

    // Moderate wind - neutral
    return {
      value: 0,
      description: null
    };
  }

  /**
   * Main bite score calculation function
   *
   * @param {string} speciesId - Species identifier
   * @param {number} hour - Hour index (0-23)
   * @param {Array} hourlyWeather - 24 hours of interpolated weather data
   * @param {object} sunTimes - { sunrise: Date, sunset: Date }
   * @param {Array} stormEvents - Storm events from WeatherAnalyzer
   * @param {number|null} lakeId - Lake ID for historical data lookup (optional)
   * @param {Array|null} weatherHistory - Historical weather data (optional)
   * @returns {object} { score, quality, factors, hour, time }
   */
  function calculateBiteScore(speciesId, hour, hourlyWeather, sunTimes, stormEvents, lakeId = null, weatherHistory = null) {
    // Get species profile
    const profile = SpeciesProfiles.getProfile(speciesId);
    if (!profile) {
      console.error(`[ScoringEngine] Unknown species: ${speciesId}`);
      return {
        score: 0,
        quality: getQualityLabel(0),
        factors: [{ category: 'error', description: 'Unknown species', impact: 0 }],
        hour,
        time: new Date()
      };
    }

    // Validate hour data
    if (!hourlyWeather || hour < 0 || hour >= hourlyWeather.length) {
      return {
        score: 0,
        quality: getQualityLabel(0),
        factors: [{ category: 'error', description: 'Invalid hour data', impact: 0 }],
        hour,
        time: new Date()
      };
    }

    const weather = hourlyWeather[hour];
    const factors = [];

    // Step 1: Start with baseline
    let score = 50;

    // Step 2: Apply time-of-day modifier
    const timeModifier = getTimeOfDayModifier(profile, hour, weather.time, sunTimes);
    score += timeModifier.value;
    if (timeModifier.value !== 0) {
      factors.push({
        category: 'time',
        description: timeModifier.description,
        impact: timeModifier.value
      });
    }

    // Step 3: Apply pressure trend
    const pressureTrend = WeatherAnalyzer.analyzePressureTrend(hourlyWeather, hour);
    const pressureImpact = pressureTrend.score * profile.weatherWeights.pressureTrend;
    score += pressureImpact;
    if (Math.abs(pressureImpact) > 2) {
      factors.push({
        category: 'pressure',
        description: pressureTrend.description,
        impact: pressureImpact
      });
    }

    // Step 4: Apply temperature trend
    const tempImpact = analyzeTempFactor(weather, profile, hourlyWeather, hour);
    score += tempImpact.value;
    if (tempImpact.value !== 0 && tempImpact.description) {
      factors.push({
        category: 'temperature',
        description: tempImpact.description,
        impact: tempImpact.value
      });
    }

    // Step 5: Apply cloud cover
    const cloudImpact = analyzeCloudCover(weather, profile, timeModifier.period);
    score += cloudImpact.value;
    if (cloudImpact.value !== 0 && cloudImpact.description) {
      factors.push({
        category: 'clouds',
        description: cloudImpact.description,
        impact: cloudImpact.value
      });
    }

    // Step 6: Apply precipitation/storm events
    const stormImpact = analyzeStormImpact(hour, stormEvents, profile);
    score += stormImpact.value;
    if (stormImpact.value !== 0 && stormImpact.description) {
      factors.push({
        category: 'precipitation',
        description: stormImpact.description,
        impact: stormImpact.value
      });
    }

    // Step 7: Apply wind
    const windImpact = analyzeWindFactor(weather, profile);
    score += windImpact.value;
    if (windImpact.value !== 0 && windImpact.description) {
      factors.push({
        category: 'wind',
        description: windImpact.description,
        impact: windImpact.value
      });
    }

    // Step 8: Apply seasonal modifier (early ice/mid-winter/late ice)
    if (typeof SeasonalAnalyzer !== 'undefined') {
      const seasonalMod = SeasonalAnalyzer.getSeasonalModifier(speciesId, weather.time);
      if (seasonalMod.value !== 0) {
        score += seasonalMod.value;
        factors.push({
          category: 'seasonal',
          description: seasonalMod.description,
          impact: seasonalMod.value
        });
      }
    }

    // Step 9: Apply moon phase modifier (affects night feeders)
    if (typeof SeasonalAnalyzer !== 'undefined') {
      const moonMod = SeasonalAnalyzer.getMoonModifier(speciesId, weather.time, timeModifier.period);
      if (moonMod.value !== 0 && moonMod.description) {
        score += moonMod.value;
        factors.push({
          category: 'moon',
          description: moonMod.description,
          impact: moonMod.value
        });
      }
    }

    // Step 10: Apply day length trend modifier
    if (typeof SeasonalAnalyzer !== 'undefined' && lakeId) {
      // Get lake coordinates from context (passed through)
      const dayLengthMod = SeasonalAnalyzer.getDayLengthModifier(
        speciesId,
        weather.time.getTimezoneOffset ? 46.5 : 46.5, // Placeholder - will use actual lat/lon
        weather.time.getTimezoneOffset ? -94.0 : -94.0,
        weather.time
      );
      if (dayLengthMod.value !== 0 && dayLengthMod.description) {
        score += dayLengthMod.value;
        factors.push({
          category: 'dayLength',
          description: dayLengthMod.description,
          impact: dayLengthMod.value
        });
      }
    }

    // Step 11: Clamp to 0-100 range
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Step 10: Sort factors by impact magnitude
    factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return {
      score,
      quality: getQualityLabel(score),
      factors: factors.slice(0, 5), // Keep top 5 factors for UI
      hour,
      time: weather.time
    };
  }

  /**
   * Calculate bite scores for all 24 hours for a species
   *
   * @param {string} speciesId - Species identifier
   * @param {Array} hourlyWeather - 24 hours of weather data
   * @param {object} sunTimes - Sunrise/sunset times
   * @param {Array} stormEvents - Storm events
   * @param {number|null} lakeId - Lake ID (optional)
   * @param {Array|null} weatherHistory - Historical data (optional)
   * @returns {Array} 24 score objects
   */
  function calculateDailyScores(speciesId, hourlyWeather, sunTimes, stormEvents, lakeId = null, weatherHistory = null) {
    const scores = [];

    for (let hour = 0; hour < 24; hour++) {
      const score = calculateBiteScore(
        speciesId,
        hour,
        hourlyWeather,
        sunTimes,
        stormEvents,
        lakeId,
        weatherHistory
      );
      scores.push(score);
    }

    return scores;
  }

  /**
   * Find best bite times (top 2-3 windows in 24 hours)
   *
   * @param {Array} scores24h - 24 hourly scores for a species
   * @returns {Array} Best time windows with start, end, peak score
   */
  function findBestBiteTimes(scores24h) {
    if (!scores24h || scores24h.length !== 24) {
      return [];
    }

    // Find local maxima (peaks) with score >= 60 (Good or better)
    const peaks = [];

    for (let i = 1; i < scores24h.length - 1; i++) {
      const current = scores24h[i].score;
      const prev = scores24h[i - 1].score;
      const next = scores24h[i + 1].score;

      // Local maximum and good quality
      if (current >= 60 && current >= prev && current >= next) {
        peaks.push({ hour: i, score: current });
      }
    }

    // Also check first and last hours (edge cases)
    if (scores24h[0].score >= 60 && scores24h[0].score >= scores24h[1].score) {
      peaks.push({ hour: 0, score: scores24h[0].score });
    }
    if (scores24h[23].score >= 60 && scores24h[23].score >= scores24h[22].score) {
      peaks.push({ hour: 23, score: scores24h[23].score });
    }

    // Sort by score descending
    peaks.sort((a, b) => b.score - a.score);

    // Take top 3 peaks
    const top3 = peaks.slice(0, 3);

    // Expand each peak into a time window (find connected hours >= 60)
    const windows = top3.map(peak => {
      let start = peak.hour;
      let end = peak.hour;

      // Expand backward
      while (start > 0 && scores24h[start - 1].score >= 60) {
        start--;
      }

      // Expand forward
      while (end < scores24h.length - 1 && scores24h[end + 1].score >= 60) {
        end++;
      }

      return {
        start: scores24h[start].time,
        end: scores24h[end].time,
        peakScore: peak.score,
        peakTime: scores24h[peak.hour].time,
        duration: end - start + 1  // Hours
      };
    });

    return windows;
  }

  /**
   * Format time window for display
   *
   * @param {Date} start - Window start time
   * @param {Date} end - Window end time
   * @returns {string} Formatted string like "Today 5-7pm" or "Tomorrow 6-8am"
   */
  function formatTimeWindow(start, end) {
    const now = new Date();
    const isToday = start.toDateString() === now.toDateString();
    const isTomorrow = start.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    const dayPrefix = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : start.toLocaleDateString('en-US', { weekday: 'short' });

    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: start.getMinutes() === 0 ? undefined : '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: end.getMinutes() === 0 ? undefined : '2-digit' });

    return `${dayPrefix} ${startTime}-${endTime}`;
  }

  /**
   * Public API
   */
  return {
    /**
     * Calculate bite score for single hour
     */
    calculateBiteScore,

    /**
     * Calculate scores for all 24 hours
     */
    calculateDailyScores,

    /**
     * Find best bite time windows
     */
    findBestBiteTimes,

    /**
     * Format time window for display
     */
    formatTimeWindow,

    /**
     * Get quality label for score
     */
    getQualityLabel,

    /**
     * Utility: Get time-of-day modifier (exposed for testing)
     */
    _getTimeOfDayModifier: getTimeOfDayModifier
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoringEngine;
}
