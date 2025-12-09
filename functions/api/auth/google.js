export function onRequestGet(context) {
  const { env } = context;

  // Test env vars access
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_REDIRECT_URI) {
    return new Response("Missing env vars", { status: 500 });
  }

  return new Response("Env vars OK: " + env.GOOGLE_CLIENT_ID.substring(0, 10) + "...");
}
