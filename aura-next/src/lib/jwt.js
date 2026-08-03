export const SESSION_COOKIE_NAME = 'aura_session';

// No `next/headers` import here (unlike session.js) so this can be shared with
// proxy.js, which runs in the Edge runtime and can't use the Route Handler cookie API.
export function getSessionSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(secret);
}
