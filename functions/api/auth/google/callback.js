export async function onRequestGet(context) {
  try {
    const jwtModule = await import('@tsndr/cloudflare-worker-jwt');
    return new Response('JWT import works! Type: ' + typeof jwtModule.default + ', sign: ' + typeof jwtModule.default.sign);
  } catch (error) {
    return new Response('JWT import FAILED: ' + error.message + '\nStack: ' + error.stack, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
