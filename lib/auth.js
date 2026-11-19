import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'smh_admin_session';

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Server configuration error: SESSION_SECRET is not set in .env.local');
  }
  return secret;
}

/**
 * Signs payload into a base64 string with HMAC-SHA256 signature
 */
export function signSession(payload) {
  const secret = getSecret();
  const data = JSON.stringify({
    ...payload,
    issuedAt: Date.now(),
  });
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verifies signed session string and returns payload if valid
 */
export function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const secret = getSecret();
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(encoded)
      .digest('base64url');

    // Timing-safe buffer comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const jsonStr = Buffer.from(encoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    // Session valid for 7 days
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.issuedAt > maxAgeMs) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * For Route Handlers: inspects request headers/cookies to authenticate admin
 */
export function verifyAdminRequest(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookiesObj = Object.fromEntries(
      cookieHeader
        .split(';')
        .map((c) => c.trim().split('='))
        .filter(([k, v]) => k && v)
        .map(([k, ...rest]) => [k, rest.join('=')])
    );

    const token = cookiesObj[ADMIN_COOKIE_NAME];
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

/**
 * For Server Components: checks current cookie
 */
export function getServerSession() {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (!cookie?.value) return null;
    return verifySession(cookie.value);
  } catch {
    return null;
  }
}

/**
 * Sets HttpOnly session cookie on a NextResponse
 */
export function setAdminCookie(response, token) {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
  return response;
}

/**
 * Clears HttpOnly session cookie on a NextResponse
 */
export function clearAdminCookie(response) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
