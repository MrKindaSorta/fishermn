/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */

export async function onRequestGet(context) {
  try {
    const { env } = context;

    console.log('[OAuth] Starting OAuth flow');

    // Validate environment variables
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      console.error('[OAuth] Missing environment variables');
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    // Generate CSRF state token
    const stateBytes = crypto.getRandomValues(new Uint8Array(16));
    const state = Array.from(stateBytes, b => b.toString(16).padStart(2, '0')).join('');

    console.log('[OAuth] Generated state token');

    // Build OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'online');
    authUrl.searchParams.set('prompt', 'select_account');

    console.log('[OAuth] Built OAuth URL');

    // Create redirect response with state cookie
    const response = Response.redirect(authUrl.toString(), 302);
    response.headers.set('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);

    console.log('[OAuth] Redirecting to Google');

    return response;

  } catch (error) {
    console.error('[OAuth] Error:', error.message);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
