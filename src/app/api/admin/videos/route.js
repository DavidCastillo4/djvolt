import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

const ALLOWED_VIDEO_TYPES = new Set([
 'video/mp4',
 'video/webm',
 'video/quicktime',
]);

const MAX_VIDEO_SIZE = 25 * 1024 * 1024;

async function isAuthorized() {
 const cookieStore = await cookies();
 return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue();
}

export async function GET() {
 try {
  if (!(await isAuthorized())) {
   return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const sql = getDatabase();
  const videos = await sql`
   SELECT
    vidpk,
    vidname,
    vidtype,
    sortid,
    createdatetime,
    octet_length(viddata) AS videosize
   FROM vid
   ORDER BY sortid, vidpk
  `;

  return NextResponse.json({ videos });
 } catch (error) {
  console.error('Unable to load uploaded videos:', error);
  return NextResponse.json({ message: 'Unable to load uploaded videos.' }, { status: 500 });
 }
}

export async function POST(request) {
 try {
  if (!(await isAuthorized())) {
   return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('video');

  if (!(file instanceof File)) {
   return NextResponse.json({ message: 'Select a video to upload.' }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
   return NextResponse.json(
    { message: `${file.name} is not a supported MP4, WebM, or MOV video.` },
    { status: 400 },
   );
  }

  if (file.size === 0) {
   return NextResponse.json({ message: `${file.name} is empty.` }, { status: 400 });
  }

  if (file.size > MAX_VIDEO_SIZE) {
   return NextResponse.json(
    { message: `${file.name} exceeds the 25 MB video limit.` },
    { status: 400 },
   );
  }

  const sql = getDatabase();
  const maxSortRows = await sql`
   SELECT COALESCE(MAX(sortid), 0) AS maxsortid
   FROM vid
  `;
  const sortId = Number(maxSortRows[0]?.maxsortid || 0) + 10;
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString('base64');

  const inserted = await sql`
   INSERT INTO vid (vidname, vidtype, viddata, sortid)
   VALUES (${file.name}, ${file.type}, decode(${base64}, 'base64'), ${sortId})
   RETURNING vidpk, vidname, vidtype, sortid, createdatetime
  `;

  return NextResponse.json({
   message: `${file.name} uploaded successfully.`,
   video: inserted[0],
  });
 } catch (error) {
  console.error('Video upload failed:', error);

  if (error?.code === '42P01') {
   return NextResponse.json(
    { message: 'The vid table does not exist in the configured database.' },
    { status: 500 },
   );
  }

  if (error?.code === '23505') {
   return NextResponse.json(
    { message: 'A sort order conflict occurred. Refresh the page and try again.' },
    { status: 409 },
   );
  }

  return NextResponse.json({ message: 'Unable to upload the selected video.' }, { status: 500 });
 }
}
