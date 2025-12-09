/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    console.log('[OAuth Callback] Started');

    // Get code and state
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return Response.redirect('/?error=oauth_failed', 302);
    }

    // Verify state
    const cookies = request.headers.get('Cookie') || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
    const savedState = stateCookie ? stateCookie.split('=')[1] : null;

    if (!savedState || savedState !== state) {
      console.error('[OAuth Callback] State mismatch');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    console.log('[OAuth Callback] State verified');

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
      console.error('[OAuth Callback] Token exchange failed');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const tokenData = await tokenResponse.json();
    console.log('[OAuth Callback] Token received');

    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });

    if (!profileResponse.ok) {
      console.error('[OAuth Callback] Profile fetch failed');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const profile = await profileResponse.json();
    console.log('[OAuth Callback] Profile received');

    // User operations
    const userId = 'user-' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const email = profile.email.toLowerCase();
    const displayName = profile.name || email.split('@')[0];

    // Check/create user
    let user = await env.DB.prepare('SELECT * FROM users WHERE oauth_provider = ? AND oauth_provider_id = ?')
      .bind('google', profile.id).first();

    if (!user) {
      user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

      if (!user) {
        await env.DB.prepare(
          'INSERT INTO users (id, email, password_hash, display_name, oauth_provider, oauth_provider_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, email, null, displayName, 'google', profile.id, Date.now()).run();

        user = { id: userId, email, display_name: displayName };
      }
    }

    // Update last login
    await env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(Date.now(), user.id).run();

    console.log('[OAuth Callback] User created/found');

    // Generate JWT (dynamic import - top-level imports cause Error 1101)
    const jwtModule = await import('@tsndr/cloudflare-worker-jwt');
    const token = await jwtModule.default.sign({
      sub: user.id,
      email: user.email || email,
      displayName: user.display_name || displayName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }, env.JWT_SECRET);

    console.log('[OAuth Callback] JWT generated');

    // Create headers with multiple Set-Cookie (PROPER WAY using Headers class)
    const headers = new Headers();
    headers.set('Location', '/');
    headers.append('Set-Cookie', 'auth_token=' + token + '; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/');
    headers.append('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');

    console.log('[OAuth Callback] Headers set, redirecting home');

    return new Response(null, {
      status: 302,
      headers: headers
    });

  } catch (error) {
    console.error('[OAuth Callback] Error:', error.message);
    console.error('[OAuth Callback] Stack:', error.stack);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
