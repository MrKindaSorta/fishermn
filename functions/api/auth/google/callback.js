/**
 * GET /api/auth/google/callback
 * Step 5: Add database operations
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return new Response('No code');
    }

    // Verify state
    const cookies = request.headers.get('Cookie') || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
    const savedState = stateCookie ? stateCookie.split('=')[1] : null;

    if (!savedState || savedState !== state) {
      return new Response('State mismatch');
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
      return new Response('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });

    if (!profileResponse.ok) {
      return new Response('Profile fetch failed');
    }

    const profile = await profileResponse.json();

    // Database operations
    const userId = 'user-' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const email = profile.email.toLowerCase();
    const displayName = profile.name || email.split('@')[0];

    // Check if user exists
    let user = await env.DB.prepare('SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ?')
      .bind('google', profile.id).first();

    if (!user) {
      user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

      if (!user) {
        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, display_name, oauth_provider, oauth_provider_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, null, displayName, 'google', profile.id, Date.now(), Date.now()).run();

        user = { id: userId, email, display_name: displayName };
      }
    }

    // Update last login
    await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(Date.now(), user.id).run();

    return new Response('Step 5 OK: User created/found! ID: ' + user.id);

  } catch (error) {
    return new Response('EXCEPTION at Step 5: ' + error.message + '\nStack: ' + error.stack);
  }
}
