/**
 * POST /api/auth/register
 * User registration endpoint
 */

import { validateRegistration, createErrorResponse, createSuccessResponse, sanitizeInput } from '../../lib/validation.js';
import { generateUserId, hashPassword, generateToken, createAuthCookie } from '../../lib/auth.js';
import { createUser, findUserByEmail, formatUserForResponse } from '../../lib/db.js';

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

    const { email, password, displayName } = body;

    // Validate input
    const validation = validateRegistration({ email, password, displayName });
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      return createErrorResponse('VALIDATION_ERROR', firstError, 422);
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedDisplayName = sanitizeInput(displayName);

    // Check if user already exists
    const existingUser = await findUserByEmail(env.DB, sanitizedEmail);
    if (existingUser) {
      return createErrorResponse('EMAIL_EXISTS', 'An account with this email already exists', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate user ID
    const userId = generateUserId();

    // Create user in database
    const newUser = await createUser(env.DB, {
      id: userId,
      email: sanitizedEmail,
      passwordHash: passwordHash,
      displayName: sanitizedDisplayName
    });

    // Generate JWT token
    const token = await generateToken({
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.display_name
    }, env.JWT_SECRET);

    // Format user for response
    const userResponse = formatUserForResponse(newUser);

    // Create response with auth cookie
    const response = createSuccessResponse({
      token: token,
      user: userResponse
    }, 201);

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', createAuthCookie(token));

    return response;

  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'Email already exists') {
      return createErrorResponse('EMAIL_EXISTS', 'An account with this email already exists', 400);
    }

    return createErrorResponse('SERVER_ERROR', 'An error occurred during registration. Please try again.', 500);
  }
}
