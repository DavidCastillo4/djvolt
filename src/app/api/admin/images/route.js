import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

const ALLOWED_IMAGE_TYPES = new Set([
 'image/jpeg',
 'image/png',
 'image/webp',
 'image/gif',
]);

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 100;

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
  const images = await sql`
   SELECT
    imgpk,
    imgname,
    imgtype,
    sortid,
    createdatetime,
    octet_length(imgdata) AS imagesize
   FROM img
   ORDER BY sortid, imgpk
  `;

  return NextResponse.json({ images });
 } catch (error) {
  console.error('Unable to load uploaded images:', error);
  return NextResponse.json({ message: 'Unable to load uploaded images.' }, { status: 500 });
 }
}

export async function POST(request) {
 try {
  if (!(await isAuthorized())) {
   return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images').filter((item) => item instanceof File);

  if (files.length === 0) {
   return NextResponse.json({ message: 'Select at least one image.' }, { status: 400 });
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
   return NextResponse.json(
    { message: `Upload no more than ${MAX_FILES_PER_UPLOAD} images at one time.` },
    { status: 400 },
   );
  }

  for (const file of files) {
   if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
     { message: `${file.name} is not a supported JPG, PNG, WebP, or GIF image.` },
     { status: 400 },
    );
   }

   if (file.size === 0) {
    return NextResponse.json({ message: `${file.name} is empty.` }, { status: 400 });
   }

   if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
     { message: `${file.name} exceeds the 10 MB image limit.` },
     { status: 400 },
    );
   }
  }

  const sql = getDatabase();
  const maxSortRows = await sql`
   SELECT COALESCE(MAX(sortid), 0) AS maxsortid
   FROM img
  `;
  const startingSortId = Number(maxSortRows[0]?.maxsortid || 0);
  const uploadedImages = [];

  for (let index = 0; index < files.length; index += 1) {
   const file = files[index];
   const bytes = Buffer.from(await file.arrayBuffer());
   const base64 = bytes.toString('base64');
   const sortId = startingSortId + ((index + 1) * 10);

   const inserted = await sql`
    INSERT INTO img (imgname, imgtype, imgdata, sortid)
    VALUES (${file.name}, ${file.type}, decode(${base64}, 'base64'), ${sortId})
    RETURNING imgpk, imgname, imgtype, sortid, createdatetime
   `;

   uploadedImages.push(inserted[0]);
  }

  return NextResponse.json({
   message: `${uploadedImages.length} image${uploadedImages.length === 1 ? '' : 's'} uploaded successfully.`,
   images: uploadedImages,
  });
 } catch (error) {
  console.error('Image upload failed:', error);

  if (error?.code === '42P01') {
   return NextResponse.json(
    { message: 'The img table does not exist in the configured database.' },
    { status: 500 },
   );
  }

  if (error?.code === '23505') {
   return NextResponse.json(
    { message: 'A sort order conflict occurred. Refresh the page and try again.' },
    { status: 409 },
   );
  }

  return NextResponse.json({ message: 'Unable to upload the selected images.' }, { status: 500 });
 }
}
