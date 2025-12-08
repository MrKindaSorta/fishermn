/**
 * POST /api/auth/login
 * User login endpoint
 */

import { validateLogin, createErrorResponse, createSuccessResponse, sanitizeInput } from '../../lib/validation.js';
import { comparePassword, generateToken, createAuthCookie } from '../../lib/auth.js';
import { findUserByEmail, updateLastLogin, formatUserForResponse } from '../../lib/db.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('INVALID_REQUEST', 'Invalid JSON in request body', 400);
    }

    const { email, password } = body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return createErrorResponse('VALIDATION_ERROR', firstError, 422);
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Find user by email
    const user = await findUserByEmail(env.DB, sanitizedEmail);
    if (!user) {
      // Use generic error message for security (don't reveal if email exists)
      return createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Check if user has a password (might be OAuth-only user)
    if (!user.password_hash) {
      return createErrorResponse('OAUTH_ONLY', 'This account uses Google sign-in. Please sign in with Google.', 400);
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Update last login time
    await updateLastLogin(env.DB, user.id);

    // Generate JWT token
    const token = await generateToken({
      id: user.id,
      email: user.email,
      displayName: user.display_name
    }, env.JWT_SECRET);

    // Format user for response
    const userResponse = formatUserForResponse(user);

    // Create response with auth cookie
    const response = createSuccessResponse({
      token: token,
      user: userResponse
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('SERVER_ERROR', 'An error occurred during login. Please try again.', 500);
  }
}
