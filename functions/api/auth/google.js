export function onRequestGet(context) {
  const { env } = context;

  // Generate state token
  const state = Math.random().toString(36).substring(2) +
                Math.random().toString(36).substring(2);

  // Build OAuth URL with string concatenation
  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth' +
    '?client_id=' + encodeURIComponent(env.GOOGLE_CLIENT_ID) +
    '&redirect_uri=' + encodeURIComponent(env.GOOGLE_REDIRECT_URI) +
    '&response_type=code' +
    '&scope=email%20profile' +
    '&state=' + state +
    '&access_type=online' +
    '&prompt=select_account';

  return new Response("OAuth URL built: " + authUrl.substring(0, 100) + "...");
}
