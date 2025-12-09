/**
 * GET /api/lakes/:slug/discussions
 * Returns discussion threads for a specific lake
 */

export async function onRequestGet(context) {
  const { params, env } = context;
  const { slug } = params;

  try {
    // First get the lake to verify it exists
    const lake = await env.DB.prepare(
      'SELECT id, name FROM lakes WHERE slug = ?'
    ).bind(slug).first();

    if (!lake) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Lake not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get discussion threads for this lake with author info
    const threads = await env.DB.prepare(`
      SELECT
        t.id,
        t.title,
        t.body,
        t.reply_count,
        t.view_count,
        t.is_pinned,
        t.is_locked,
        t.last_reply_at,
        t.created_at,
        t.updated_at,
        u.id as author_id,
        u.display_name as author_display_name,
        u.rank_tier as author_rank_tier
      FROM discussion_threads t
      JOIN users u ON t.user_id = u.id
      WHERE t.lake_id = ?
      ORDER BY t.is_pinned DESC, t.last_reply_at DESC NULLS LAST, t.created_at DESC
      LIMIT 50
    `).bind(lake.id).all();

    // Get all thread IDs to fetch their posts
    const threadIds = (threads.results || []).map(t => t.id);

    // If we have threads, get their posts
    let postsMap = {};
    if (threadIds.length > 0) {
      // SQLite doesn't support array params, so we build the IN clause
      const placeholders = threadIds.map(() => '?').join(',');
      const posts = await env.DB.prepare(`
        SELECT
          p.id,
          p.thread_id,
          p.body,
          p.created_at,
          p.updated_at,
          u.id as author_id,
          u.display_name as author_display_name,
          u.rank_tier as author_rank_tier
        FROM discussion_posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.thread_id IN (${placeholders})
        ORDER BY p.created_at ASC
      `).bind(...threadIds).all();

      // Group posts by thread_id
      (posts.results || []).forEach(post => {
        if (!postsMap[post.thread_id]) {
          postsMap[post.thread_id] = [];
        }
        postsMap[post.thread_id].push({
          id: post.id,
          body: post.body,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          author: {
            id: post.author_id,
            displayName: post.author_display_name,
            rankTier: post.author_rank_tier || 'Novice'
          }
        });
      });
    }

    // Transform threads to camelCase and attach posts
    const transformedThreads = (threads.results || []).map(t => {
      // The first "post" is the thread body itself (OP)
      const threadPosts = postsMap[t.id] || [];

      return {
        id: t.id,
        title: t.title,
        body: t.body,
        replyCount: t.reply_count || 0,
        viewCount: t.view_count || 0,
        isPinned: !!t.is_pinned,
        isLocked: !!t.is_locked,
        lastReplyAt: t.last_reply_at,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        author: {
          id: t.author_id,
          displayName: t.author_display_name,
          rankTier: t.author_rank_tier || 'Novice'
        },
        posts: threadPosts
      };
    });

    return new Response(JSON.stringify({
      success: true,
      lakeId: lake.id,
      lakeName: lake.name,
      threads: transformedThreads,
      count: transformedThreads.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[discussions] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load discussions'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
