/**
 * GET /api/auth/google
 * Incremental test - add OAuth params without state/cookies
 */

export async function onRequestGet(context) {
  try {
    const { env } = context;

    console.log('[OAuth] Step 1: Got env');

    // Build URL with OAuth params (no state yet)
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(env.GOOGLE_REDIRECT_URI) +
      '&response_type=code' +
      '&scope=email%20profile' +
      '&access_type=online' +
      '&prompt=select_account';

    console.log('[OAuth] Step 2: Built URL');

    // Simple redirect without cookies
    return Response.redirect(authUrl, 302);

  } catch (error) {
    console.error('[OAuth] Error:', error.message);
    return new Response('Error: ' + error.message, { status: 200 });
  }
}
