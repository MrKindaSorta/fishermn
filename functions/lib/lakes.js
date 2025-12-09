/**
 * Lake Database Query Utilities for Cloudflare D1
 */

/**
 * Get all lakes
 * @param {D1Database} db - D1 database instance
 * @returns {Promise<Array>} Array of lake objects
 */
export async function getAllLakes(db) {
  try {
    const result = await db
      .prepare('SELECT * FROM lakes ORDER BY name ASC')
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting all lakes:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Find lake by slug
 * @param {D1Database} db - D1 database instance
 * @param {string} slug - Lake slug
 * @returns {Promise<Object|null>} Lake object or null if not found
 */
export async function findLakeBySlug(db, slug) {
  try {
    const result = await db
      .prepare('SELECT * FROM lakes WHERE slug = ?')
      .bind(slug)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error finding lake by slug:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Find lake by ID
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @returns {Promise<Object|null>} Lake object or null if not found
 */
export async function findLakeById(db, lakeId) {
  try {
    const result = await db
      .prepare('SELECT * FROM lakes WHERE id = ?')
      .bind(lakeId)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error finding lake by ID:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Get ice reports for a lake
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @param {number} limit - Maximum number of reports to return
 * @returns {Promise<Array>} Array of ice report objects with user info
 */
export async function getIceReportsForLake(db, lakeId, limit = 20) {
  try {
    const result = await db
      .prepare(`
        SELECT
          ir.*,
          u.display_name as user_display_name,
          u.rank_tier as user_rank_tier,
          u.reliability_score as user_reliability
        FROM ice_reports ir
        JOIN users u ON ir.user_id = u.id
        WHERE ir.lake_id = ?
        ORDER BY ir.reported_at DESC
        LIMIT ?
      `)
      .bind(lakeId, limit)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting ice reports:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Get catch reports for a lake
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @param {number} limit - Maximum number of reports to return
 * @returns {Promise<Array>} Array of catch report objects with user info
 */
export async function getCatchReportsForLake(db, lakeId, limit = 20) {
  try {
    const result = await db
      .prepare(`
        SELECT
          cr.*,
          u.display_name as user_display_name,
          u.rank_tier as user_rank_tier
        FROM catch_reports cr
        JOIN users u ON cr.user_id = u.id
        WHERE cr.lake_id = ?
        ORDER BY cr.caught_at DESC
        LIMIT ?
      `)
      .bind(lakeId, limit)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting catch reports:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Create an ice report
 * @param {D1Database} db - D1 database instance
 * @param {Object} reportData - Ice report data
 * @returns {Promise<Object>} Created ice report
 */
export async function createIceReport(db, reportData) {
  const {
    id,
    lakeId,
    userId,
    thicknessInches,
    condition,
    locationNotes = null,
    latitude = null,
    longitude = null,
    reportedAt
  } = reportData;

  const now = new Date().toISOString();

  try {
    await db
      .prepare(`
        INSERT INTO ice_reports (
          id, lake_id, user_id,
          thickness_inches, condition, location_notes,
          latitude, longitude,
          reported_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, lakeId, userId,
        thicknessInches, condition, locationNotes,
        latitude, longitude,
        reportedAt, now
      )
      .run();

    // Return the created report
    return await db
      .prepare('SELECT * FROM ice_reports WHERE id = ?')
      .bind(id)
      .first();
  } catch (error) {
    console.error('Error creating ice report:', error);
    throw new Error('Failed to create ice report');
  }
}

/**
 * Create a catch report
 * @param {D1Database} db - D1 database instance
 * @param {Object} reportData - Catch report data
 * @returns {Promise<Object>} Created catch report
 */
export async function createCatchReport(db, reportData) {
  const {
    id,
    lakeId,
    userId,
    fishSpecies,
    fishCount = 1,
    largestSizeInches = null,
    largestWeightLbs = null,
    depthFeet = null,
    baitUsed = null,
    locationNotes = null,
    photoUrl = null,
    caughtAt
  } = reportData;

  const now = new Date().toISOString();

  try {
    await db
      .prepare(`
        INSERT INTO catch_reports (
          id, lake_id, user_id,
          fish_species, fish_count, largest_size_inches, largest_weight_lbs,
          depth_feet, bait_used, location_notes,
          photo_url, caught_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, lakeId, userId,
        fishSpecies, fishCount, largestSizeInches, largestWeightLbs,
        depthFeet, baitUsed, locationNotes,
        photoUrl, caughtAt, now
      )
      .run();

    // Return the created report
    return await db
      .prepare('SELECT * FROM catch_reports WHERE id = ?')
      .bind(id)
      .first();
  } catch (error) {
    console.error('Error creating catch report:', error);
    throw new Error('Failed to create catch report');
  }
}

/**
 * Check if user has favorited a lake
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {string} lakeId - Lake ID
 * @returns {Promise<boolean>} True if favorited
 */
export async function isLakeFavorited(db, userId, lakeId) {
  try {
    const result = await db
      .prepare('SELECT 1 FROM lake_favorites WHERE user_id = ? AND lake_id = ?')
      .bind(userId, lakeId)
      .first();

    return !!result;
  } catch (error) {
    console.error('Error checking lake favorite:', error);
    return false;
  }
}

/**
 * Add lake to favorites
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {string} lakeId - Lake ID
 * @returns {Promise<void>}
 */
export async function addLakeFavorite(db, userId, lakeId) {
  const now = new Date().toISOString();

  try {
    await db
      .prepare('INSERT OR IGNORE INTO lake_favorites (user_id, lake_id, created_at) VALUES (?, ?, ?)')
      .bind(userId, lakeId, now)
      .run();
  } catch (error) {
    console.error('Error adding lake favorite:', error);
    throw new Error('Failed to add favorite');
  }
}

/**
 * Remove lake from favorites
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {string} lakeId - Lake ID
 * @returns {Promise<void>}
 */
export async function removeLakeFavorite(db, userId, lakeId) {
  try {
    await db
      .prepare('DELETE FROM lake_favorites WHERE user_id = ? AND lake_id = ?')
      .bind(userId, lakeId)
      .run();
  } catch (error) {
    console.error('Error removing lake favorite:', error);
    throw new Error('Failed to remove favorite');
  }
}

/**
 * Get user's favorite lakes
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of lake objects
 */
export async function getUserFavoriteLakes(db, userId) {
  try {
    const result = await db
      .prepare(`
        SELECT l.*
        FROM lakes l
        JOIN lake_favorites lf ON l.id = lf.lake_id
        WHERE lf.user_id = ?
        ORDER BY l.name ASC
      `)
      .bind(userId)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting favorite lakes:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Get report counts for a lake
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @returns {Promise<Object>} Object with ice_count and catch_count
 */
export async function getLakeReportCounts(db, lakeId) {
  try {
    const iceCount = await db
      .prepare('SELECT COUNT(*) as count FROM ice_reports WHERE lake_id = ?')
      .bind(lakeId)
      .first();

    const catchCount = await db
      .prepare('SELECT COUNT(*) as count FROM catch_reports WHERE lake_id = ?')
      .bind(lakeId)
      .first();

    return {
      iceCount: iceCount?.count || 0,
      catchCount: catchCount?.count || 0,
      totalCount: (iceCount?.count || 0) + (catchCount?.count || 0)
    };
  } catch (error) {
    console.error('Error getting report counts:', error);
    return { iceCount: 0, catchCount: 0, totalCount: 0 };
  }
}

/**
 * Format lake object for API response
 * @param {Object} lake - Lake object from database
 * @returns {Object} Formatted lake object
 */
export function formatLakeForResponse(lake) {
  if (!lake) return null;

  return {
    id: lake.id,
    slug: lake.slug,
    name: lake.name,
    region: lake.region,
    latitude: lake.latitude,
    longitude: lake.longitude,
    amenities: {
      hasCasino: !!lake.has_casino,
      hasBaitShop: !!lake.has_bait_shop,
      hasIceHouseRental: !!lake.has_ice_house_rental,
      hasLodging: !!lake.has_lodging,
      hasRestaurant: !!lake.has_restaurant,
      hasBoatLaunch: !!lake.has_boat_launch,
      hasGasStation: !!lake.has_gas_station,
      hasGrocery: !!lake.has_grocery,
      hasGuideService: !!lake.has_guide_service,
      barsCount: lake.bars_count || 0
    },
    officialIce: {
      thickness: lake.official_ice_thickness,
      condition: lake.official_ice_condition,
      updatedAt: lake.official_ice_updated_at
    },
    createdAt: lake.created_at,
    updatedAt: lake.updated_at
  };
}

/**
 * Format ice report for API response
 * @param {Object} report - Ice report from database
 * @returns {Object} Formatted ice report
 */
export function formatIceReportForResponse(report) {
  if (!report) return null;

  return {
    id: report.id,
    lakeId: report.lake_id,
    thicknessInches: report.thickness_inches,
    condition: report.condition,
    locationNotes: report.location_notes,
    latitude: report.latitude,
    longitude: report.longitude,
    reportedAt: report.reported_at,
    createdAt: report.created_at,
    user: {
      displayName: report.user_display_name,
      rankTier: report.user_rank_tier,
      reliabilityScore: report.user_reliability
    }
  };
}

/**
 * Format catch report for API response
 * @param {Object} report - Catch report from database
 * @returns {Object} Formatted catch report
 */
export function formatCatchReportForResponse(report) {
  if (!report) return null;

  return {
    id: report.id,
    lakeId: report.lake_id,
    fishSpecies: report.fish_species,
    fishCount: report.fish_count,
    largestSizeInches: report.largest_size_inches,
    largestWeightLbs: report.largest_weight_lbs,
    depthFeet: report.depth_feet,
    baitUsed: report.bait_used,
    locationNotes: report.location_notes,
    photoUrl: report.photo_url,
    caughtAt: report.caught_at,
    createdAt: report.created_at,
    user: {
      displayName: report.user_display_name,
      rankTier: report.user_rank_tier
    }
  };
}
