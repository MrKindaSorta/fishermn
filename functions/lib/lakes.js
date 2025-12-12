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
          u.reliability_score as user_reliability,
          (SELECT COUNT(*) FROM comments WHERE content_type = 'ice' AND content_id = ir.id) as comment_count
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
          u.rank_tier as user_rank_tier,
          (SELECT COUNT(*) FROM comments WHERE content_type = 'catch' AND content_id = cr.id) as comment_count
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
    reportedAt,
    onLake = false
  } = reportData;

  const now = new Date().toISOString();
  const onLakeValue = onLake ? 1 : 0;

  try {
    await db
      .prepare(`
        INSERT INTO ice_reports (
          id, lake_id, user_id,
          thickness_inches, condition, location_notes,
          latitude, longitude,
          reported_at, created_at, on_lake
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, lakeId, userId,
        thicknessInches, condition, locationNotes,
        latitude, longitude,
        reportedAt, now, onLakeValue
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
    caughtAt,
    reportedLater = false
  } = reportData;

  const now = new Date().toISOString();
  const reportedLaterValue = reportedLater ? 1 : 0;

  try {
    await db
      .prepare(`
        INSERT INTO catch_reports (
          id, lake_id, user_id,
          fish_species, fish_count, largest_size_inches, largest_weight_lbs,
          depth_feet, bait_used, location_notes,
          photo_url, caught_at, created_at, reported_later
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, lakeId, userId,
        fishSpecies, fishCount, largestSizeInches, largestWeightLbs,
        depthFeet, baitUsed, locationNotes,
        photoUrl, caughtAt, now, reportedLaterValue
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
 * Get current ice status from most recent report (single lake)
 * @param {D1Database} db - Database instance
 * @param {string} lakeId - Lake ID
 * @returns {Promise<Object|null>} Current ice status or null
 */
export async function getCurrentIceStatus(db, lakeId) {
  try {
    const result = await db
      .prepare(`
        SELECT
          thickness_inches as thickness,
          condition,
          reported_at as updatedAt
        FROM ice_reports
        WHERE lake_id = ?
          AND reported_at > datetime('now', '-7 days')
        ORDER BY reported_at DESC
        LIMIT 1
      `)
      .bind(lakeId)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error getting current ice status:', error);
    return null;
  }
}

/**
 * Get ice statistics for a lake (average, max, min)
 * @param {D1Database} db - Database instance
 * @param {string} lakeId - Lake ID
 * @returns {Promise<Object>} Ice statistics
 */
export async function getIceStatistics(db, lakeId) {
  try {
    // Get average thickness from last 7 days
    const avgResult = await db
      .prepare(`
        SELECT AVG(thickness_inches) as average, COUNT(*) as count
        FROM ice_reports
        WHERE lake_id = ?
          AND reported_at > datetime('now', '-7 days')
      `)
      .bind(lakeId)
      .first();

    // Get max and min thickness from last 3 days
    const extremesResult = await db
      .prepare(`
        SELECT
          MAX(thickness_inches) as max,
          MIN(thickness_inches) as min
        FROM ice_reports
        WHERE lake_id = ?
          AND reported_at > datetime('now', '-3 days')
      `)
      .bind(lakeId)
      .first();

    return {
      average: avgResult?.average ? Math.round(avgResult.average) : null,
      max: extremesResult?.max || null,
      min: extremesResult?.min || null,
      reportCount: avgResult?.count || 0
    };
  } catch (error) {
    console.error('Error getting ice statistics:', error);
    return { average: null, max: null, min: null, reportCount: 0 };
  }
}

/**
 * Get current ice status from most recent reports (batch version)
 * @param {D1Database} db - Database instance
 * @param {Array<string>} lakeIds - Array of lake IDs
 * @returns {Promise<Object>} Map of lakeId -> ice status
 */
export async function getAllCurrentIceStatus(db, lakeIds) {
  if (!lakeIds || lakeIds.length === 0) return {};

  try {
    // Batch queries to avoid SQLite parameter limit (max ~999 parameters)
    const batchSize = 100;
    const statusMap = {};

    for (let i = 0; i < lakeIds.length; i += batchSize) {
      const batch = lakeIds.slice(i, i + batchSize);
      const placeholders = batch.map(() => '?').join(',');

      // Get most recent ice report per lake from last 7 days
      const query = `
        SELECT
          lake_id,
          thickness_inches as thickness,
          condition,
          reported_at as updatedAt
        FROM ice_reports ir1
        WHERE lake_id IN (${placeholders})
          AND reported_at > datetime('now', '-7 days')
          AND reported_at = (
            SELECT MAX(reported_at)
            FROM ice_reports ir2
            WHERE ir2.lake_id = ir1.lake_id
              AND ir2.reported_at > datetime('now', '-7 days')
          )
      `;

      const result = await db.prepare(query).bind(...batch).all();

      // Add to status map
      (result.results || []).forEach(row => {
        statusMap[row.lake_id] = {
          thickness: row.thickness,
          condition: row.condition,
          updatedAt: row.updatedAt
        };
      });
    }

    return statusMap;
  } catch (error) {
    console.error('Error getting batch ice status:', error);
    return {};
  }
}

/**
 * Format lake object for API response
 * @param {Object} lake - Lake object from database
 * @param {Object|null} computedIce - Computed ice status (optional)
 * @returns {Object} Formatted lake object
 */
export function formatLakeForResponse(lake, computedIce = null) {
  if (!lake) return null;

  // Use computed ice status (from reports) if provided, otherwise fall back to DB fields
  const officialIce = computedIce || {
    thickness: lake.official_ice_thickness,
    condition: lake.official_ice_condition,
    updatedAt: lake.official_ice_updated_at
  };

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
    officialIce,  // Now uses computed ice status from reports!
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
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0,
    commentCount: report.comment_count || 0,
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
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0,
    commentCount: report.comment_count || 0,
    user: {
      displayName: report.user_display_name,
      rankTier: report.user_rank_tier
    }
  };
}

/**
 * Get snow reports for a lake
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @param {number} limit - Maximum number of reports to return
 * @returns {Promise<Array>} Array of snow report objects with user info
 */
export async function getSnowReportsForLake(db, lakeId, limit = 20) {
  try {
    const result = await db
      .prepare(`
        SELECT
          sr.*,
          u.display_name as user_display_name,
          u.rank_tier as user_rank_tier,
          u.reliability_score as user_reliability,
          (SELECT COUNT(*) FROM comments WHERE content_type = 'snow' AND content_id = sr.id) as comment_count
        FROM snow_reports sr
        JOIN users u ON sr.user_id = u.id
        WHERE sr.lake_id = ?
        ORDER BY sr.reported_at DESC
        LIMIT ?
      `)
      .bind(lakeId, limit)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting snow reports:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Create a snow report
 * @param {D1Database} db - D1 database instance
 * @param {Object} reportData - Snow report data
 * @returns {Promise<Object>} Created snow report
 */
export async function createSnowReport(db, reportData) {
  const {
    id,
    lakeId,
    userId,
    thicknessInches,
    snowType,
    coverage,
    locationNotes = null,
    reportedAt,
    onLake = false
  } = reportData;

  const now = new Date().toISOString();
  const onLakeValue = onLake ? 1 : 0;

  try {
    await db
      .prepare(`
        INSERT INTO snow_reports (
          id, lake_id, user_id,
          thickness_inches, snow_type, coverage, location_notes,
          reported_at, created_at, on_lake
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        id, lakeId, userId,
        thicknessInches, snowType, coverage, locationNotes,
        reportedAt, now, onLakeValue
      )
      .run();

    // Return the created report
    return await db
      .prepare('SELECT * FROM snow_reports WHERE id = ?')
      .bind(id)
      .first();
  } catch (error) {
    console.error('Error creating snow report:', error);
    throw new Error('Failed to create snow report');
  }
}

/**
 * Format snow report for API response
 * @param {Object} report - Snow report from database
 * @returns {Object} Formatted snow report
 */
export function formatSnowReportForResponse(report) {
  if (!report) return null;

  return {
    id: report.id,
    lakeId: report.lake_id,
    thicknessInches: report.thickness_inches,
    snowType: report.snow_type,
    coverage: report.coverage,
    locationNotes: report.location_notes,
    reportedAt: report.reported_at,
    createdAt: report.created_at,
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0,
    commentCount: report.comment_count || 0,
    user: {
      displayName: report.user_display_name,
      rankTier: report.user_rank_tier,
      reliabilityScore: report.user_reliability
    }
  };
}

/**
 * Get lake updates (general comments)
 * @param {D1Database} db - D1 database instance
 * @param {string} lakeId - Lake ID
 * @param {number} limit - Maximum number of updates to return
 * @returns {Promise<Array>} Array of lake update objects with user info
 */
export async function getLakeUpdates(db, lakeId, limit = 20) {
  try {
    const result = await db
      .prepare(`
        SELECT
          lu.*,
          u.display_name as user_display_name,
          u.rank_tier as user_rank_tier,
          u.reliability_score as user_reliability,
          (SELECT COUNT(*) FROM comments WHERE content_type = 'update' AND content_id = lu.id) as comment_count
        FROM lake_updates lu
        JOIN users u ON lu.user_id = u.id
        WHERE lu.lake_id = ?
        ORDER BY lu.created_at DESC
        LIMIT ?
      `)
      .bind(lakeId, limit)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting lake updates:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Create a lake update
 * @param {D1Database} db - D1 database instance
 * @param {Object} updateData - Lake update data
 * @returns {Promise<Object>} Created lake update
 */
export async function createLakeUpdate(db, updateData) {
  const {
    id,
    lakeId,
    userId,
    content,
    createdAt
  } = updateData;

  try {
    await db
      .prepare(`
        INSERT INTO lake_updates (
          id, lake_id, user_id, content, created_at
        ) VALUES (?, ?, ?, ?, ?)
      `)
      .bind(id, lakeId, userId, content, createdAt)
      .run();

    // Return the created update
    return await db
      .prepare('SELECT * FROM lake_updates WHERE id = ?')
      .bind(id)
      .first();
  } catch (error) {
    console.error('Error creating lake update:', error);
    throw new Error('Failed to create lake update');
  }
}

/**
 * Format lake update for API response
 * @param {Object} update - Lake update from database
 * @returns {Object} Formatted lake update
 */
export function formatLakeUpdateForResponse(update) {
  if (!update) return null;

  return {
    id: update.id,
    lakeId: update.lake_id,
    content: update.content,
    createdAt: update.created_at,
    upvotes: update.upvotes || 0,
    downvotes: update.downvotes || 0,
    commentCount: update.comment_count || 0,
    user: {
      displayName: update.user_display_name,
      rankTier: update.user_rank_tier,
      reliabilityScore: update.user_reliability
    }
  };
}

// ==================== VOTING FUNCTIONS ====================

/**
 * Get user's vote on a specific content item
 * @param {D1Database} db - Database instance
 * @param {string} userId - User ID
 * @param {string} contentType - 'ice', 'catch', 'snow', 'update'
 * @param {string} contentId - Content item ID
 * @returns {Promise<Object|null>} Vote object or null
 */
export async function getUserVote(db, userId, contentType, contentId) {
  try {
    const result = await db
      .prepare('SELECT * FROM votes WHERE user_id = ? AND report_type = ? AND report_id = ?')
      .bind(userId, contentType, contentId)
      .first();
    return result || null;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
}

/**
 * Create or update a vote (handles vote changes and removal)
 * @param {D1Database} db - Database instance
 * @param {string} userId - User ID
 * @param {string} contentType - 'ice', 'catch', 'snow', 'update'
 * @param {string} contentId - Content item ID
 * @param {string} voteType - 'up' or 'down'
 * @returns {Promise<Object>} Result with action and vote state
 */
export async function upsertVote(db, userId, contentType, contentId, voteType) {
  const now = new Date().toISOString();
  const voteId = `vote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Check for existing vote
  const existingVote = await getUserVote(db, userId, contentType, contentId);

  // Determine table name from content type
  const tableName = contentType === 'ice' ? 'ice_reports'
    : contentType === 'catch' ? 'catch_reports'
    : contentType === 'snow' ? 'snow_reports'
    : 'lake_updates';

  try {
    if (!existingVote) {
      // New vote - insert and increment count
      await db.batch([
        db.prepare('INSERT INTO votes (id, user_id, report_type, report_id, vote_type, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(voteId, userId, contentType, contentId, voteType, now),
        db.prepare(`UPDATE ${tableName} SET ${voteType === 'up' ? 'upvotes' : 'downvotes'} = ${voteType === 'up' ? 'upvotes' : 'downvotes'} + 1 WHERE id = ?`)
          .bind(contentId)
      ]);

      return { action: 'created', previousVote: null, newVote: voteType };
    } else if (existingVote.vote_type === voteType) {
      // Same vote - remove it (toggle off)
      await db.batch([
        db.prepare('DELETE FROM votes WHERE user_id = ? AND report_type = ? AND report_id = ?')
          .bind(userId, contentType, contentId),
        db.prepare(`UPDATE ${tableName} SET ${voteType === 'up' ? 'upvotes' : 'downvotes'} = MAX(0, ${voteType === 'up' ? 'upvotes' : 'downvotes'} - 1) WHERE id = ?`)
          .bind(contentId)
      ]);

      return { action: 'removed', previousVote: voteType, newVote: null };
    } else {
      // Different vote - change it (decrement old, increment new)
      const oldType = existingVote.vote_type;
      const oldColumn = oldType === 'up' ? 'upvotes' : 'downvotes';
      const newColumn = voteType === 'up' ? 'upvotes' : 'downvotes';

      await db.batch([
        db.prepare('UPDATE votes SET vote_type = ? WHERE user_id = ? AND report_type = ? AND report_id = ?')
          .bind(voteType, userId, contentType, contentId),
        db.prepare(`UPDATE ${tableName} SET ${oldColumn} = MAX(0, ${oldColumn} - 1), ${newColumn} = ${newColumn} + 1 WHERE id = ?`)
          .bind(contentId)
      ]);

      return { action: 'changed', previousVote: oldType, newVote: voteType };
    }
  } catch (error) {
    console.error('Error upserting vote:', error);
    throw new Error('Failed to update vote');
  }
}

// ==================== COMMENT FUNCTIONS ====================

/**
 * Get comments for content with pagination and sorting
 * @param {D1Database} db - Database instance
 * @param {string} contentType - 'ice', 'catch', 'snow', 'update'
 * @param {string} contentId - Content item ID
 * @param {Object} options - { sortBy: 'newest'|'liked', limit: 10, offset: 0 }
 * @returns {Promise<Array>} Array of comments with user info
 */
export async function getComments(db, contentType, contentId, options = {}) {
  const { sortBy = 'newest', limit = 10, offset = 0 } = options;

  const orderBy = sortBy === 'liked'
    ? 'c.upvotes DESC, c.created_at DESC'  // Most liked, then newest
    : 'c.created_at DESC';                  // Newest first

  try {
    const result = await db
      .prepare(`
        SELECT
          c.*,
          u.display_name as user_display_name,
          u.rank_tier as user_rank_tier
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.content_type = ? AND c.content_id = ?
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `)
      .bind(contentType, contentId, limit, offset)
      .all();

    return result.results || [];
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Get comment count for content
 * @param {D1Database} db - Database instance
 * @param {string} contentType - Content type
 * @param {string} contentId - Content ID
 * @returns {Promise<number>} Comment count
 */
export async function getCommentCount(db, contentType, contentId) {
  try {
    const result = await db
      .prepare('SELECT COUNT(*) as count FROM comments WHERE content_type = ? AND content_id = ?')
      .bind(contentType, contentId)
      .first();
    return result?.count || 0;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
}

/**
 * Create a comment
 * @param {D1Database} db - Database instance
 * @param {Object} commentData - Comment data
 * @returns {Promise<Object>} Created comment
 */
export async function createComment(db, commentData) {
  const { id, userId, contentType, contentId, body, createdAt } = commentData;

  try {
    await db
      .prepare(`
        INSERT INTO comments (id, user_id, content_type, content_id, body, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(id, userId, contentType, contentId, body, createdAt)
      .run();

    return await db
      .prepare('SELECT * FROM comments WHERE id = ?')
      .bind(id)
      .first();
  } catch (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to create comment');
  }
}

/**
 * Vote on a comment
 * @param {D1Database} db - Database instance
 * @param {string} userId - User ID
 * @param {string} commentId - Comment ID
 * @param {string} voteType - 'up' or 'down'
 * @returns {Promise<Object>} Vote result
 */
export async function voteOnComment(db, userId, commentId, voteType) {
  const now = new Date().toISOString();
  const voteId = `cvote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Check existing vote
    const existingVote = await db
      .prepare('SELECT * FROM comment_votes WHERE user_id = ? AND comment_id = ?')
      .bind(userId, commentId)
      .first();

    if (!existingVote) {
      // New vote
      await db.batch([
        db.prepare('INSERT INTO comment_votes (id, user_id, comment_id, vote_type, created_at) VALUES (?, ?, ?, ?, ?)')
          .bind(voteId, userId, commentId, voteType, now),
        db.prepare(`UPDATE comments SET ${voteType === 'up' ? 'upvotes' : 'downvotes'} = ${voteType === 'up' ? 'upvotes' : 'downvotes'} + 1 WHERE id = ?`)
          .bind(commentId)
      ]);
      return { action: 'created', newVote: voteType };
    } else if (existingVote.vote_type === voteType) {
      // Remove vote
      await db.batch([
        db.prepare('DELETE FROM comment_votes WHERE user_id = ? AND comment_id = ?')
          .bind(userId, commentId),
        db.prepare(`UPDATE comments SET ${voteType === 'up' ? 'upvotes' : 'downvotes'} = MAX(0, ${voteType === 'up' ? 'upvotes' : 'downvotes'} - 1) WHERE id = ?`)
          .bind(commentId)
      ]);
      return { action: 'removed', newVote: null };
    } else {
      // Change vote
      const oldType = existingVote.vote_type;
      const oldColumn = oldType === 'up' ? 'upvotes' : 'downvotes';
      const newColumn = voteType === 'up' ? 'upvotes' : 'downvotes';

      await db.batch([
        db.prepare('UPDATE comment_votes SET vote_type = ? WHERE user_id = ? AND comment_id = ?')
          .bind(voteType, userId, commentId),
        db.prepare(`UPDATE comments SET ${oldColumn} = MAX(0, ${oldColumn} - 1), ${newColumn} = ${newColumn} + 1 WHERE id = ?`)
          .bind(commentId)
      ]);
      return { action: 'changed', newVote: voteType };
    }
  } catch (error) {
    console.error('Error voting on comment:', error);
    throw new Error('Failed to vote on comment');
  }
}

/**
 * Format comment for API response
 * @param {Object} comment - Comment from database
 * @returns {Object} Formatted comment
 */
export function formatCommentForResponse(comment) {
  if (!comment) return null;

  return {
    id: comment.id,
    contentType: comment.content_type,
    contentId: comment.content_id,
    body: comment.body,
    upvotes: comment.upvotes || 0,
    downvotes: comment.downvotes || 0,
    createdAt: comment.created_at,
    user: {
      displayName: comment.user_display_name,
      rankTier: comment.user_rank_tier
    }
  };
}
