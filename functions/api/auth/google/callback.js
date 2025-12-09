export async function onRequestGet(context) {
  const { request } = context;
  const code = new URL(request.url).searchParams.get('code');

  const headers = new Headers();
  headers.set("Location", "/");
  headers.append("Set-Cookie", "test_cookie=hello; HttpOnly; Secure; Path=/; Max-Age=60");

  return new Response(null, { status: 302, headers });
}
