/**
 * GET /api/auth/google/callback
 * Complete OAuth callback handler
 */

import jwt from '@tsndr/cloudflare-worker-jwt';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
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
      return Response.redirect('/?error=oauth_failed', 302);
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
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });

    if (!profileResponse.ok) {
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const profile = await profileResponse.json();

    // Database operations
    const userId = 'user-' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    const email = profile.email.toLowerCase();
    const displayName = profile.name || email.split('@')[0];

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
    await env.DB.prepare('UPDATE users SET last_login_at = ? WHERE id = ?')
      .bind(Date.now(), user.id).run();

    // Generate JWT
    const token = await jwt.sign({
      sub: user.id,
      email: user.email || email,
      displayName: user.display_name || displayName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }, env.JWT_SECRET);

    // Format user data for frontend
    const userData = {
      id: user.id,
      email: user.email || email,
      displayName: user.display_name || displayName
    };

    // Return HTML that saves to localStorage then redirects
    const html = `<!DOCTYPE html>
<html>
<head><title>Logging in...</title></head>
<body>
<script>
  try {
    localStorage.setItem('fishermn_auth_token', ${JSON.stringify(token)});
    localStorage.setItem('fishermn_user_data', ${JSON.stringify(JSON.stringify(userData))});
    window.location.href = '/';
  } catch(e) {
    console.error('Auth save failed:', e);
    window.location.href = '/?error=oauth_failed';
  }
</script>
<p>Logging in...</p>
</body>
</html>`;

    const headers = new Headers();
    headers.append('Set-Cookie', 'auth_token=' + token + '; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/');
    headers.append('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/');
    headers.set('Content-Type', 'text/html');

    return new Response(html, { status: 200, headers });

  } catch (error) {
    console.error('[OAuth Callback] Error:', error.message);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
