/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback - simplified version for testing
 */

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    console.log('[OAuth Callback] Received callback');

    // Get authorization code
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code) {
      console.error('[OAuth Callback] No code provided');
      return Response.redirect('/?error=oauth_failed', 302);
    }

    console.log('[OAuth Callback] Code received, length:', code.length);

    // For now, just show success
    return new Response(JSON.stringify({
      success: true,
      message: 'OAuth callback received successfully',
      hasCode: !!code,
      hasState: !!state,
      codeLength: code?.length || 0
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[OAuth Callback] Error:', error.message);
    return new Response('Callback error: ' + error.message, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
