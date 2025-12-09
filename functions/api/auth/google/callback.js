/**
 * GET /api/auth/google/callback
 * Step 4: Add profile fetch
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response('Step 1 FAILED: No code');
    }

    // Verify state
    const cookies = request.headers.get('Cookie') || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
    const savedState = stateCookie ? stateCookie.split('=')[1] : null;

    if (!savedState || savedState !== state) {
      return new Response('Step 2 FAILED: State mismatch');
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'code=' + encodeURIComponent(code) +
            '&client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
            '&client_secret=' + encodeURIComponent(env.GOOGLE_CLIENT_SECRET) +
            '&redirect_uri=' + encodeURIComponent(env.GOOGLE_REDIRECT_URI) +
            '&grant_type=authorization_code'
    });

    if (!tokenResponse.ok) {
      return new Response('Step 3 FAILED: Token exchange - status ' + tokenResponse.status);
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });

    if (!profileResponse.ok) {
      return new Response('Step 4 FAILED: Profile fetch - status ' + profileResponse.status);
    }

    const profile = await profileResponse.json();

    return new Response('Step 4 OK: Got profile! Email: ' + profile.email + ', Name: ' + profile.name);

  } catch (error) {
    return new Response('EXCEPTION: ' + error.message + '\nStack: ' + error.stack);
  }
}
