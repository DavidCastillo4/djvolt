import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function authorized() {
 const store = await cookies();
 return store.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue();
}

export async function PUT(request) {
 try {
  if (!(await authorized())) {
   return NextResponse.json({ message: 'Your admin session has expired.' }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
   return NextResponse.json({ message: 'Enter the current password.' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length === 0) {
   return NextResponse.json({ message: 'Enter a new password.' }, { status: 400 });
  }
  if (newPassword.length > 50) {
   return NextResponse.json({ message: 'The password must be 50 characters or fewer.' }, { status: 400 });
  }
  if (currentPassword === newPassword) {
   return NextResponse.json({ message: 'Choose a new password that is different from the current password.' }, { status: 400 });
  }

  const sql = getDatabase();
  const updated = await sql`
   UPDATE settings
   SET password = ${newPassword}
   WHERE settingpk = (
    SELECT settingpk
    FROM settings
    WHERE password = ${currentPassword}
    ORDER BY settingpk
    LIMIT 1
   )
   RETURNING settingpk
  `;

  if (!updated.length) {
   return NextResponse.json({ message: 'The current password is incorrect.' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error('Unable to change admin password:', error);
  return NextResponse.json({ message: 'Unable to change the admin password.' }, { status: 500 });
 }
}
