/**
 * GET /api/auth/google
 * Diagnostic version to identify 500 error cause
 */

export async function onRequestGet(context) {
  try {
    console.log('[OAuth Test] Endpoint called');
    console.log('[OAuth Test] Context:', typeof context);
    console.log('[OAuth Test] Has env:', !!context?.env);

    const { env } = context;

    // Check environment variables
    const hasClientId = !!env?.GOOGLE_CLIENT_ID;
    const hasRedirectUri = !!env?.GOOGLE_REDIRECT_URI;

    console.log('[OAuth Test] Has GOOGLE_CLIENT_ID:', hasClientId);
    console.log('[OAuth Test] Has GOOGLE_REDIRECT_URI:', hasRedirectUri);

    const diagnostics = {
      endpointWorking: true,
      contextType: typeof context,
      hasEnv: !!env,
      hasClientId,
      hasRedirectUri,
      clientIdLength: env?.GOOGLE_CLIENT_ID?.length || 0,
      redirectUriValue: env?.GOOGLE_REDIRECT_URI || 'undefined'
    };

    return new Response(JSON.stringify(diagnostics, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[OAuth Test] Error:', error);
    console.error('[OAuth Test] Error message:', error.message);
    console.error('[OAuth Test] Error stack:', error.stack);

    return new Response(JSON.stringify({
      error: true,
      message: error.message,
      stack: error.stack
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
