import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { signSession, setAdminCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Server configuration error: ADMIN_USERNAME or ADMIN_PASSWORD is not set in .env.local',
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Secure timing-safe comparison to prevent side-channel timing attacks
    const userMatch =
      username.length === adminUsername.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(adminUsername));

    const passMatch =
      password.length === adminPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

    if (!userMatch || !passMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create signed session token
    const token = signSession({ username: adminUsername, role: 'admin' });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authentication successful',
      user: { username: adminUsername },
    });

    // Set HttpOnly cookie
    setAdminCookie(response, token);

    return response;
  } catch (error) {
    console.error('POST /api/admin/login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication error: ' + error.message },
      { status: 500 }
    );
  }
}
