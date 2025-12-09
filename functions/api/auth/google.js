export async function onRequestGet(context) {
  try {
    const { env } = context;

    console.log('[OAuth] Starting OAuth flow');

    // Validate env vars
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    console.log('[OAuth] Environment variables validated');

    // Generate state token
    const state = Math.random().toString(36).substring(2) +
                  Math.random().toString(36).substring(2);

    console.log('[OAuth] Generated state token');

    // Build OAuth URL
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(env.GOOGLE_REDIRECT_URI) +
      '&response_type=code' +
      '&scope=email%20profile' +
      '&state=' + state +
      '&access_type=online' +
      '&prompt=select_account';

    console.log('[OAuth] Built OAuth URL');

    // Create redirect with state cookie
    const response = Response.redirect(authUrl, 302);

    console.log('[OAuth] Created redirect response');

    response.headers.set('Set-Cookie',
      'oauth_state=' + state + '; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/');

    console.log('[OAuth] Set cookie header');

    return response;

  } catch (error) {
    console.error('[OAuth] Error:', error);
    return new Response('Error: ' + error.message, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
