/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */

import { generateUserId, generateToken, createAuthCookie } from '../../../lib/auth.js';
import { findUserByOAuth, findUserByEmail, createUser, updateLastLogin, formatUserForResponse } from '../../../lib/db.js';
import { sanitizeInput } from '../../../lib/validation.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  try {
    // Get authorization code and state from query params
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      return Response.redirect('/?error=oauth_failed', 302);
    }

    // Verify state token (CSRF protection)
    const cookies = request.headers.get('Cookie') || '';
    const stateCookie = cookies.split(';').find(c => c.trim().startsWith('oauth_state='));
    const savedState = stateCookie?.split('=')[1];

    if (!savedState || savedState !== state) {
      console.error('OAuth state mismatch');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code: code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      console.error('Failed to fetch user profile');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    const profile = await profileResponse.json();
    // profile contains: id, email, name, picture, verified_email

    // Sanitize inputs
    const googleId = profile.id;
    const email = sanitizeInput(profile.email).toLowerCase();
    const displayName = sanitizeInput(profile.name || profile.email.split('@')[0]);

    // Check if user already exists with this Google account
    let user = await findUserByOAuth(env.DB, 'google', googleId);

    if (!user) {
      // Check if email already exists (user might have registered with email/password)
      user = await findUserByEmail(env.DB, email);

      if (user) {
        // Link Google account to existing user
        // For now, we'll just log them in
        // In production, you might want to update their oauth_provider fields
        console.log('User exists with email, logging in');
      } else {
        // Create new user with Google OAuth
        const userId = generateUserId();
        user = await createUser(env.DB, {
          id: userId,
          email: email,
          passwordHash: null, // No password for OAuth users
          displayName: displayName,
          oauthProvider: 'google',
          oauthProviderId: googleId
        });
      }
    }

    // Update last login
    await updateLastLogin(env.DB, user.id);

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      displayName: user.display_name
    }, env.JWT_SECRET);

    // Redirect to home page with auth cookie
    const response = Response.redirect('/', 302);

    // Set auth cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    // Clear state cookie
    response.headers.append(
      'Set-Cookie',
      'oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/'
    );

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return Response.redirect('/?error=oauth_failed', 302);
  }
}
