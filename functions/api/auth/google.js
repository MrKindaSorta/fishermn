/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */

export async function onRequestGet(context) {
  const { env } = context;

  try {
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

    // Log configuration (partial for security)
    console.log('[OAuth] Client ID:', env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
    console.log('[OAuth] Redirect URI:', env.GOOGLE_REDIRECT_URI);

    // Generate random state token for CSRF protection
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

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

    // Validate the constructed URL doesn't contain undefined/null
    if (authUrl.includes('undefined') || authUrl.includes('null')) {
      console.error('[OAuth] Invalid OAuth URL constructed:', authUrl);
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    console.log('[OAuth] Redirecting to Google OAuth');

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
