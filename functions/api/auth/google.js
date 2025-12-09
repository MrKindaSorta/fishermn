/**
 * GET /api/auth/google
 * Simplified test to identify what's causing the 500 error
 */

export async function onRequestGet(context) {
  try {
    const { env } = context;

    console.log('[OAuth] Starting OAuth flow');

    // Test 1: Can we build a simple URL?
    const testUrl = 'https://accounts.google.com/o/oauth2/v2/auth?test=1';
    console.log('[OAuth] Test URL:', testUrl);

    // Test 2: Can we create a redirect response?
    const response = Response.redirect(testUrl, 302);
    console.log('[OAuth] Created redirect response');

    return response;

  } catch (error) {
    console.error('[OAuth] Error:', error);
    return new Response('Error: ' + error.message, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
