/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */

export async function onRequestGet(context) {
  try {
    const { env } = context;

    console.log('[OAuth] Initiating Google OAuth flow');

    // Validate required environment variables
    if (!env.GOOGLE_CLIENT_ID) {
      console.error('[OAuth] Missing GOOGLE_CLIENT_ID environment variable');
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    if (!env.GOOGLE_REDIRECT_URI) {
      console.error('[OAuth] Missing GOOGLE_REDIRECT_URI environment variable');
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    console.log('[OAuth] Environment variables validated');

    // Generate random state token for CSRF protection
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('[OAuth] Generated state token');

    // Build Google OAuth authorization URL
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'email profile',
      state: state,
      access_type: 'online',
      prompt: 'select_account'
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    console.log('[OAuth] Built authorization URL, redirecting to Google');

    // Store state in cookie for verification in callback
    const response = Response.redirect(authUrl, 302);
    response.headers.set(
      'Set-Cookie',
      `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
    );

    return response;

  } catch (error) {
    console.error('[OAuth] Error initiating Google OAuth:', error);
    console.error('[OAuth] Error message:', error.message);
    console.error('[OAuth] Error stack:', error.stack);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
