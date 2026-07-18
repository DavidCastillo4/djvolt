import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const VIDEO_MAX_BYTES = Math.floor(4.2 * 1024 * 1024);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_TYPES = new Set(['video/mp4']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const VIDEO_EXTENSIONS = new Set(['mp4']);

function getExtension(name = '') {
 return String(name).split('.').pop()?.toLowerCase() || '';
}

function hasExpectedSignature(data, mimeType) {
 if (mimeType === 'image/jpeg') return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
 if (mimeType === 'image/png') return data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
 if (mimeType === 'image/gif') return data.length >= 6 && ['GIF87a', 'GIF89a'].includes(data.subarray(0, 6).toString('ascii'));
 if (mimeType === 'image/webp') return data.length >= 12 && data.subarray(0, 4).toString('ascii') === 'RIFF' && data.subarray(8, 12).toString('ascii') === 'WEBP';
 if (mimeType === 'video/mp4') return data.length >= 12 && data.subarray(4, 8).toString('ascii') === 'ftyp';
 return false;
}

async function isAuthorized() {
 const cookieStore = await cookies();
 return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue();
}

function unauthorized() {
 return NextResponse.json({ message: 'Your admin session has expired.' }, { status: 401 });
}

function normalizeBoolean(value) {
 return value === true || value === 'true';
}

export async function GET() {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const sql = getDatabase();
  const rows = await sql`
   SELECT
    imgpk AS id,
    'image' AS type,
    imgname AS name,
    imgtype AS mime_type,
    sortid,
    COALESCE(isgallery, TRUE) AS isgallery,
    FALSE AS ishero,
    FALSE AS isbackground
   FROM img

   UNION ALL

   SELECT
    vidpk AS id,
    'video' AS type,
    CONCAT('Video ', vidpk) AS name,
    vidtype AS mime_type,
    sortid,
    COALESCE(isgallery, TRUE) AS isgallery,
    COALESCE(ishero, FALSE) AS ishero,
    COALESCE(isbackground, FALSE) AS isbackground
   FROM vid

   ORDER BY sortid, type, id
  `;

  return NextResponse.json({
   items: rows.map((row) => ({
    id: Number(row.id),
    key: `${row.type}-${row.id}`,
    type: row.type,
    name: row.name,
    mimeType: row.mime_type,
    sortId: Number(row.sortid),
    isGallery: Boolean(row.isgallery),
    isHero: Boolean(row.ishero),
    isBackground: Boolean(row.isbackground),
    src: row.type === 'video' ? `/api/videos/id/${row.id}` : `/api/images/${row.id}`,
   })),
  });
 } catch (error) {
  console.error('Unable to load admin gallery:', error);
  return NextResponse.json({ message: 'Unable to load the gallery.' }, { status: 500 });
 }
}

export async function POST(request) {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const formData = await request.formData();
  const entries = formData.getAll('file').filter((file) => file && typeof file.arrayBuffer === 'function');

  if (entries.length !== 1) {
   return NextResponse.json({ message: 'Upload one image or video at a time.' }, { status: 400 });
  }

  const file = entries[0];
  const mimeType = String(file.type || '').toLowerCase();
  const extension = getExtension(file.name);
  const isImage = IMAGE_TYPES.has(mimeType) && IMAGE_EXTENSIONS.has(extension);
  const isVideo = VIDEO_TYPES.has(mimeType) && VIDEO_EXTENSIONS.has(extension);

  if (extension === 'heic' || extension === 'heif' || mimeType === 'image/heic' || mimeType === 'image/heif') {
   return NextResponse.json(
    { message: 'HEIC photos are not supported. Please convert the photo to JPG before uploading.' },
    { status: 415 }
   );
  }

  if (!isImage && !isVideo) {
   return NextResponse.json(
    { message: mimeType.startsWith('video/') ? 'This video format is not supported. Please upload an MP4 video.' : 'This file type is not supported.' },
    { status: 415 }
   );
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
   return NextResponse.json({ message: 'This file is empty. Please choose another file.' }, { status: 400 });
  }

  if (isImage && file.size > IMAGE_MAX_BYTES) {
   return NextResponse.json({ message: 'This image is too large. Images must be 4 MB or smaller.' }, { status: 413 });
  }

  if (isVideo && file.size > VIDEO_MAX_BYTES) {
   return NextResponse.json({ message: 'This video is too large. Videos must be 4.2 MB or smaller.' }, { status: 413 });
  }

  const data = Buffer.from(await file.arrayBuffer());
  if (data.length === 0) {
   return NextResponse.json({ message: 'This file is empty. Please choose another file.' }, { status: 400 });
  }

  if (!hasExpectedSignature(data, mimeType)) {
   return NextResponse.json(
    { message: 'This file could not be read or does not match its file type. Please choose another file.' },
    { status: 415 }
   );
  }

  const sql = getDatabase();
  const maxRows = await sql`
   SELECT GREATEST(
    COALESCE((SELECT MAX(sortid) FROM img), 0),
    COALESCE((SELECT MAX(sortid) FROM vid), 0)
   ) AS maxsortid
  `;
  const nextSortId = Number(maxRows[0]?.maxsortid || 0) + 10;

  if (isImage) {
   const safeName = String(file.name || `image-${Date.now()}.jpg`).slice(0, 255);
   await sql`
    INSERT INTO img (imgname, imgtype, imgdata, sortid, isgallery)
    VALUES (${safeName}, ${mimeType}, ${data}, ${nextSortId}, TRUE)
   `;
  } else {
   await sql`
    INSERT INTO vid (vidtype, viddata, sortid, ishero, isbackground, isgallery)
    VALUES (${mimeType}, ${data}, ${nextSortId}, FALSE, FALSE, TRUE)
   `;
  }

  return NextResponse.json({ success: true, uploaded: 1 });
 } catch (error) {
  console.error('Unable to upload gallery media:', error);
  return NextResponse.json({ message: 'Unable to upload the selected media.' }, { status: 500 });
 }
}

export async function PATCH(request) {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const body = await request.json();
  const sql = getDatabase();

  if (body.action === 'visibility') {
   const id = Number(body.id);
   const type = body.type;
   const isGallery = normalizeBoolean(body.isGallery);

   if (!Number.isInteger(id) || !['image', 'video'].includes(type)) {
    return NextResponse.json({ message: 'Invalid gallery item.' }, { status: 400 });
   }

   if (type === 'image') {
    await sql`UPDATE img SET isgallery = ${isGallery} WHERE imgpk = ${id}`;
   } else {
    await sql`UPDATE vid SET isgallery = ${isGallery} WHERE vidpk = ${id}`;
   }

   return NextResponse.json({ success: true });
  }

  if (body.action === 'reorder') {
   const items = Array.isArray(body.items) ? body.items : [];
   if (items.length === 0) {
    return NextResponse.json({ message: 'No gallery order was supplied.' }, { status: 400 });
   }

   const normalized = items.map((item, index) => ({
    id: Number(item.id),
    type: item.type,
    sortId: (index + 1) * 10,
    temporarySortId: -((index + 1) * 10),
   }));

   if (normalized.some((item) => !Number.isInteger(item.id) || !['image', 'video'].includes(item.type))) {
    return NextResponse.json({ message: 'The gallery order contains an invalid item.' }, { status: 400 });
   }

   // Move everything to temporary negative values first so unique sort indexes cannot collide.
   for (const item of normalized) {
    if (item.type === 'image') {
     await sql`UPDATE img SET sortid = ${item.temporarySortId} WHERE imgpk = ${item.id}`;
    } else {
     await sql`UPDATE vid SET sortid = ${item.temporarySortId} WHERE vidpk = ${item.id}`;
    }
   }

   for (const item of normalized) {
    if (item.type === 'image') {
     await sql`UPDATE img SET sortid = ${item.sortId} WHERE imgpk = ${item.id}`;
    } else {
     await sql`UPDATE vid SET sortid = ${item.sortId} WHERE vidpk = ${item.id}`;
    }
   }

   return NextResponse.json({ success: true });
  }

  return NextResponse.json({ message: 'Unknown gallery update.' }, { status: 400 });
 } catch (error) {
  console.error('Unable to update admin gallery:', error);
  return NextResponse.json({ message: 'Unable to save the gallery changes.' }, { status: 500 });
 }
}

export async function DELETE(request) {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const { id: rawId, type } = await request.json();
  const id = Number(rawId);

  if (!Number.isInteger(id) || !['image', 'video'].includes(type)) {
   return NextResponse.json({ message: 'Invalid gallery item.' }, { status: 400 });
  }

  const sql = getDatabase();

  if (type === 'video') {
   const videos = await sql`
    SELECT COALESCE(ishero, FALSE) AS ishero, COALESCE(isbackground, FALSE) AS isbackground
    FROM vid
    WHERE vidpk = ${id}
    LIMIT 1
   `;

   if (videos.length === 0) {
    return NextResponse.json({ message: 'Video not found.' }, { status: 404 });
   }

   if (videos[0].ishero || videos[0].isbackground) {
    return NextResponse.json(
     { message: 'This video is being used as a website background. Choose another background video before deleting it.' },
     { status: 409 }
    );
   }

   await sql`DELETE FROM vid WHERE vidpk = ${id}`;
  } else {
   await sql`DELETE FROM img WHERE imgpk = ${id}`;
  }

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error('Unable to delete gallery media:', error);
  return NextResponse.json({ message: 'Unable to delete this gallery item.' }, { status: 500 });
 }
}
