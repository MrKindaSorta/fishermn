export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  return new Response('Callback received! Code: ' + code.substring(0, 20) + '... State: ' + state, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
