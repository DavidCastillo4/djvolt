import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(request) {
 try {
  const { password } = await request.json();

  if (typeof password !== 'string' || password.length === 0) {
   return NextResponse.json({ message: 'Enter the admin password.' }, { status: 400 });
  }

  const sql = getDatabase();
  const matchingSettings = await sql`
   SELECT settingpk
   FROM settings
   WHERE password = ${password}
   LIMIT 1
  `;

  if (matchingSettings.length === 0) {
   return NextResponse.json({ message: 'The password is incorrect.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set({
   name: ADMIN_COOKIE_NAME,
   value: getAdminSessionValue(),
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax',
   path: '/',
   maxAge: 60 * 60 * 12,
  });

  return response;
 } catch (error) {
  console.error('Admin login failed:', error);
  return NextResponse.json({ message: 'Unable to sign in.' }, { status: 500 });
 }
}
