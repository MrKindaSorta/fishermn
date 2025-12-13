/**
 * Baits API - Search unique bait values from catch reports
 * GET /api/baits?search=term&limit=5
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get('search') || '';
  const limit = parseInt(url.searchParams.get('limit')) || 5;

  try {
    // Query unique baits with usage count, filtered by search term
    const baits = await env.DB
      .prepare(`
        SELECT bait_used as name, COUNT(*) as usage_count
        FROM catch_reports
        WHERE bait_used IS NOT NULL
          AND bait_used != ''
          AND LOWER(bait_used) LIKE LOWER(?)
        GROUP BY LOWER(bait_used)
        ORDER BY usage_count DESC, bait_used ASC
        LIMIT ?
      `)
      .bind(`%${searchTerm}%`, limit)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        baits: baits.results || []
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error searching baits:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to search baits'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        status: 500
      }
    );
  }
}
