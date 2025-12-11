/**
 * Seasonal Analyzer Module
 *
 * Calculates seasonal, lunar, and photoperiod (day length) effects on fish feeding.
 * Uses SunCalc library for astronomical calculations (no external API calls).
 *
 * Factors:
 * - Ice fishing season stage (early ice, mid-winter, late ice)
 * - Moon phase and illumination
 * - Day length trends (lengthening vs shortening days)
 *
 * @module SeasonalAnalyzer
 */

const SeasonalAnalyzer = (() => {
  'use strict';

  /**
   * Determine ice fishing season stage for a given date
   *
   * @param {Date} date - Date to check
   * @returns {string} 'early_ice' | 'mid_winter' | 'late_ice' | 'off_season'
   */
  function getSeason(date) {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Early Ice: Nov 20 - Dec 31
    if ((month === 11 && day >= 20) || month === 12) {
      return 'early_ice';
    }

    // Mid-Winter: Jan 1 - Feb 10
    if (month === 1 || (month === 2 && day <= 10)) {
      return 'mid_winter';
    }

    // Late Ice: Feb 11 - Mar 31
    if ((month === 2 && day > 10) || month === 3) {
      return 'late_ice';
    }

    // Off-season (not ice fishing time)
    return 'off_season';
  }

  /**
   * Get seasonal modifier for a species at given date
   *
   * @param {string} speciesId - Species identifier
   * @param {Date} date - Date to check
   * @returns {object} { value, description, season }
   */
  function getSeasonalModifier(speciesId, date) {
    const season = getSeason(date);

    if (season === 'off_season') {
      return { value: 0, description: 'Off-season', season };
    }

    const profile = SpeciesProfiles.getProfile(speciesId);
    if (!profile || !profile.seasonalModifiers) {
      return { value: 0, description: 'No seasonal data', season };
    }

    const modifier = profile.seasonalModifiers[season] || 0;

    let description = '';
    if (season === 'early_ice') {
      description = modifier > 0
        ? `Early ice bonus - ${profile.name} aggressive on fresh ice`
        : `Early ice season`;
    } else if (season === 'mid_winter') {
      description = modifier > 0
        ? `Mid-winter spawn season for ${profile.name}`
        : modifier < 0
        ? `Mid-winter doldrums - ${profile.name} less active in coldest period`
        : `Mid-winter core season`;
    } else if (season === 'late_ice') {
      description = modifier > 0
        ? `Late ice magic - ${profile.name} pre-spawn feeding surge`
        : modifier < 0
        ? `Post-spawn decline for ${profile.name}`
        : `Late ice period`;
    }

    return { value: modifier, description, season };
  }

  /**
   * Calculate moon phase using SunCalc
   *
   * @param {Date} date - Date to calculate for
   * @returns {object} { fraction, phase, name }
   */
  function getMoonPhase(date) {
    if (typeof SunCalc === 'undefined') {
      console.warn('[SeasonalAnalyzer] SunCalc not loaded');
      return { fraction: 0.5, phase: 'unknown', name: 'Unknown' };
    }

    const moonIllum = SunCalc.getMoonIllumination(date);
    const fraction = moonIllum.fraction; // 0-1 (0=new, 0.5=full, 1=new again)

    // Determine moon phase category
    let phase, name;

    if (fraction > 0.95 || fraction < 0.05) {
      phase = 'new';
      name = 'New Moon';
    } else if (fraction >= 0.45 && fraction <= 0.55) {
      phase = 'full';
      name = 'Full Moon';
    } else if (fraction > 0.55 && fraction < 0.95) {
      phase = 'waning_gibbous';
      name = 'Waning Gibbous';
    } else if (fraction > 0.05 && fraction < 0.45) {
      phase = 'waxing_gibbous';
      name = 'Waxing Gibbous';
    } else if (Math.abs(fraction - 0.25) < 0.05) {
      phase = 'first_quarter';
      name = 'First Quarter';
    } else if (Math.abs(fraction - 0.75) < 0.05) {
      phase = 'last_quarter';
      name = 'Last Quarter';
    } else {
      phase = 'neutral';
      name = 'Between Phases';
    }

    return { fraction, phase, name };
  }

  /**
   * Get moon phase modifier for a species
   *
   * @param {string} speciesId - Species identifier
   * @param {Date} date - Date to check
   * @param {string} timeOfDay - Time period (dawn/day/dusk/night/etc)
   * @returns {object} { value, description }
   */
  function getMoonModifier(speciesId, date, timeOfDay) {
    const profile = SpeciesProfiles.getProfile(speciesId);
    if (!profile) {
      return { value: 0, description: null };
    }

    // Moon only affects at night
    if (timeOfDay !== 'night' && timeOfDay !== 'early_night' && timeOfDay !== 'late_night') {
      return { value: 0, description: null };
    }

    // Only night feeders affected
    if (!profile.nightFeeder) {
      return { value: 0, description: null };
    }

    const moon = getMoonPhase(date);
    const sensitivity = profile.moonSensitivity || 0;

    let baseModifier = 0;
    let description = '';

    switch (moon.phase) {
      case 'full':
        baseModifier = 8;
        description = `${moon.name} - enhanced night visibility for ${profile.name}`;
        break;
      case 'waxing_gibbous':
      case 'waning_gibbous':
        baseModifier = 5;
        description = `${moon.name} - good light for night feeding`;
        break;
      case 'first_quarter':
      case 'last_quarter':
        baseModifier = 3;
        description = `${moon.name} - moderate lunar influence`;
        break;
      case 'new':
        baseModifier = 3; // Solunar theory suggests new moon also active
        description = `${moon.name} - solunar peak despite darkness`;
        break;
      default:
        baseModifier = 0;
    }

    const adjustedModifier = Math.round(baseModifier * sensitivity);

    return {
      value: adjustedModifier,
      description: adjustedModifier !== 0 ? description : null
    };
  }

  /**
   * Calculate day length and trend using SunCalc
   *
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {Date} date - Date to calculate for
   * @returns {object} { dayLengthMinutes, changeMins, trend, description }
   */
  function getDayLengthTrend(lat, lon, date) {
    if (typeof SunCalc === 'undefined') {
      console.warn('[SeasonalAnalyzer] SunCalc not loaded');
      return { dayLengthMinutes: 540, changeMins: 0, trend: 'stable', description: 'Day length data unavailable' };
    }

    const today = SunCalc.getTimes(date, lat, lon);
    const yesterday = SunCalc.getTimes(new Date(date.getTime() - 86400000), lat, lon);

    const todayLength = (today.sunset - today.sunrise) / 60000; // minutes
    const yesterdayLength = (yesterday.sunset - yesterday.sunrise) / 60000;

    const change = todayLength - yesterdayLength;

    let trend, description;

    if (change > 1) {
      trend = 'lengthening';
      description = `Days lengthening (+${Math.round(change)} min/day) - fish becoming more active`;
    } else if (change < -1) {
      trend = 'shortening';
      description = `Days shortening (${Math.round(change)} min/day) - fish slowing for winter`;
    } else {
      trend = 'stable';
      description = null; // Stable days don't need description
    }

    return {
      dayLengthMinutes: Math.round(todayLength),
      changeMins: Math.round(change * 10) / 10,
      trend,
      description
    };
  }

  /**
   * Get day length trend modifier for a species
   *
   * @param {string} speciesId - Species identifier
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {Date} date - Date to check
   * @returns {object} { value, description }
   */
  function getDayLengthModifier(speciesId, lat, lon, date) {
    const profile = SpeciesProfiles.getProfile(speciesId);
    if (!profile) {
      return { value: 0, description: null };
    }

    const dayLength = getDayLengthTrend(lat, lon, date);
    const sensitivity = profile.dayLengthSensitivity || 0;

    let baseModifier = 0;

    if (dayLength.trend === 'lengthening' && dayLength.changeMins > 1) {
      baseModifier = 5;
    } else if (dayLength.trend === 'shortening' && dayLength.changeMins < -1) {
      baseModifier = -3;
    } else if (dayLength.trend === 'stable' && dayLength.dayLengthMinutes < 540) {
      // Stable short days (mid-winter)
      baseModifier = -2;
    }

    const adjustedModifier = Math.round(baseModifier * sensitivity);

    return {
      value: adjustedModifier,
      description: adjustedModifier !== 0 ? dayLength.description : null
    };
  }

  /**
   * Public API
   */
  return {
    /**
     * Get ice fishing season stage
     */
    getSeason,

    /**
     * Get seasonal modifier for species
     */
    getSeasonalModifier,

    /**
     * Get moon phase data
     */
    getMoonPhase,

    /**
     * Get moon phase modifier
     */
    getMoonModifier,

    /**
     * Get day length trend data
     */
    getDayLengthTrend,

    /**
     * Get day length modifier
     */
    getDayLengthModifier
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeasonalAnalyzer;
}
