/**
 * Database Query Utilities for Cloudflare D1
 */

/**
 * Find user by email
 * @param {D1Database} db - D1 database instance
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function findUserByEmail(db, email) {
  try {
    const result = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Find user by ID
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function findUserById(db, userId) {
  try {
    const result = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(userId)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Find user by OAuth provider
 * @param {D1Database} db - D1 database instance
 * @param {string} provider - OAuth provider (e.g., 'google')
 * @param {string} providerId - Provider-specific user ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function findUserByOAuth(db, provider, providerId) {
  try {
    const result = await db
      .prepare('SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ?')
      .bind(provider, providerId)
      .first();

    return result || null;
  } catch (error) {
    console.error('Error finding user by OAuth:', error);
    throw new Error('Database query failed');
  }
}

/**
 * Create a new user
 * @param {D1Database} db - D1 database instance
 * @param {Object} userData - User data object
 * @returns {Promise<Object>} Created user object
 */
export async function createUser(db, userData) {
  const {
    id,
    email,
    passwordHash,
    displayName,
    oauthProvider = null,
    oauthProviderId = null
  } = userData;

  const now = new Date().toISOString();

  try {
    await db
      .prepare(`
        INSERT INTO users (
          id, email, password_hash, display_name,
          oauth_provider, oauth_provider_id,
          rank_level, rank_tier, rank_band, xp, next_level_xp,
          reliability_score, reliability_votes,
          ice_reports, catch_reports, lakes_visited, check_ins,
          created_at, updated_at, last_login_at
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?,
          1, 'Rookie', 'Bronze', 0, 100,
          0.0, 0,
          0, 0, 0, 0,
          ?, ?, ?
        )
      `)
      .bind(
        id, email, passwordHash, displayName,
        oauthProvider, oauthProviderId,
        now, now, now
      )
      .run();

    // Fetch and return the created user
    return await findUserById(db, id);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.message && error.message.includes('UNIQUE')) {
      throw new Error('Email already exists');
    }
    throw new Error('Failed to create user');
  }
}

/**
 * Update user's last login time
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function updateLastLogin(db, userId) {
  const now = new Date().toISOString();

  try {
    await db
      .prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?')
      .bind(now, now, userId)
      .run();
  } catch (error) {
    console.error('Error updating last login:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Update user XP and rank
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {Object} updates - Updates object with xp, rank_level, rank_tier, rank_band
 * @returns {Promise<void>}
 */
export async function updateUserRank(db, userId, updates) {
  const { xp, rankLevel, rankTier, rankBand, nextLevelXp } = updates;
  const now = new Date().toISOString();

  try {
    await db
      .prepare(`
        UPDATE users
        SET xp = ?, rank_level = ?, rank_tier = ?, rank_band = ?, next_level_xp = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(xp, rankLevel, rankTier, rankBand, nextLevelXp, now, userId)
      .run();
  } catch (error) {
    console.error('Error updating user rank:', error);
    throw new Error('Failed to update user rank');
  }
}

/**
 * Increment user report count
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {string} reportType - Type of report ('ice', 'catch', or 'snow')
 * @returns {Promise<void>}
 */
export async function incrementReportCount(db, userId, reportType) {
  let column;
  if (reportType === 'ice') {
    column = 'ice_reports';
  } else if (reportType === 'catch') {
    column = 'catch_reports';
  } else if (reportType === 'snow') {
    column = 'snow_reports';
  } else {
    throw new Error('Invalid report type');
  }

  const now = new Date().toISOString();

  try {
    await db
      .prepare(`UPDATE users SET ${column} = ${column} + 1, updated_at = ? WHERE id = ?`)
      .bind(now, userId)
      .run();
  } catch (error) {
    console.error('Error incrementing report count:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Update user profile information
 * @param {D1Database} db - D1 database instance
 * @param {string} userId - User ID
 * @param {Object} updates - Profile updates (displayName, etc.)
 * @returns {Promise<Object>} Updated user object
 */
export async function updateUserProfile(db, userId, updates) {
  const { displayName } = updates;
  const now = new Date().toISOString();

  try {
    await db
      .prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?')
      .bind(displayName, now, userId)
      .run();

    // Fetch and return updated user
    return await findUserById(db, userId);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Format user object for API response (remove sensitive fields)
 * @param {Object} user - User object from database
 * @returns {Object} Sanitized user object
 */
export function formatUserForResponse(user) {
  if (!user) return null;

  const {
    password_hash,
    oauth_provider_id,
    ...safeUser
  } = user;

  // Rename snake_case to camelCase for frontend
  return {
    id: safeUser.id,
    email: safeUser.email,
    displayName: safeUser.display_name,
    oauthProvider: safeUser.oauth_provider,
    rankLevel: safeUser.rank_level,
    rankTier: safeUser.rank_tier,
    rankBand: safeUser.rank_band,
    xp: safeUser.xp,
    nextLevelXp: safeUser.next_level_xp,
    reliabilityScore: safeUser.reliability_score,
    reliabilityVotes: safeUser.reliability_votes,
    iceReports: safeUser.ice_reports,
    catchReports: safeUser.catch_reports,
    lakesVisited: safeUser.lakes_visited,
    checkIns: safeUser.check_ins,
    createdAt: safeUser.created_at,
    lastLoginAt: safeUser.last_login_at
  };
}
