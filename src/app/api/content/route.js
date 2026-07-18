import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from '@/lib/siteContent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureContentColumn(sql) {
 await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS content JSONB`;
}

async function authorized() {
 const store = await cookies();
 return store.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue();
}

export async function GET() {
 try {
  const sql = getDatabase();
  await ensureContentColumn(sql);
  const rows = await sql`SELECT content FROM settings ORDER BY settingpk LIMIT 1`;
  return NextResponse.json({ content: mergeSiteContent(rows[0]?.content || {}) });
 } catch (error) {
  console.error('Unable to load site content:', error);
  return NextResponse.json({ content: DEFAULT_SITE_CONTENT });
 }
}

export async function PUT(request) {
 try {
  if (!(await authorized())) return NextResponse.json({ message: 'Your admin session has expired.' }, { status: 401 });
  const body = await request.json();
  const content = mergeSiteContent(body?.content || {});
  const encoded = JSON.stringify(content);
  if (encoded.length > 50000) return NextResponse.json({ message: 'The content is too large to save.' }, { status: 400 });
  const sql = getDatabase();
  await ensureContentColumn(sql);
  const rows = await sql`UPDATE settings SET content = ${encoded}::jsonb RETURNING settingpk`;
  if (!rows.length) return NextResponse.json({ message: 'The settings record could not be found.' }, { status: 500 });
  return NextResponse.json({ success: true, content });
 } catch (error) {
  console.error('Unable to save site content:', error);
  return NextResponse.json({ message: 'Unable to save the website content.' }, { status: 500 });
 }
}
