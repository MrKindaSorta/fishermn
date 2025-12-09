/**
 * GET /api/auth/google
 * Initiate Google OAuth flow
 */

export async function onRequestGet(context) {
  const { env } = context;

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

  // Store state in cookie for verification in callback
  // In production, you might want to store this in a more secure way
  const response = Response.redirect(authUrl, 302);
  response.headers.set(
    'Set-Cookie',
    `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`
  );

  return response;
}
