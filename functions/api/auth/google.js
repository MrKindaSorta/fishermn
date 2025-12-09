export async function onRequestGet(context) {
  try {
    const { env } = context;

    // Validate env vars
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
      return Response.redirect('/?error=oauth_config_error', 302);
    }

    // Generate state token
    const state = Math.random().toString(36).substring(2) +
                  Math.random().toString(36).substring(2);

    // Build OAuth URL
    const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
      '?client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(env.GOOGLE_REDIRECT_URI) +
      '&response_type=code' +
      '&scope=email%20profile' +
      '&state=' + state +
      '&access_type=online' +
      '&prompt=select_account';

    // Create redirect with state cookie
    const response = Response.redirect(authUrl, 302);
    response.headers.set('Set-Cookie',
      'oauth_state=' + state + '; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/');

    return response;

  } catch (error) {
    console.error('[OAuth] Error:', error.message);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
