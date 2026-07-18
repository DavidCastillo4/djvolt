import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
 try {
  const { imgName } = await params;
  const requestedName = String(imgName || '').trim();

  if (!requestedName || requestedName.length > 255) {
   return new Response('Invalid image name.', { status: 400 });
  }

  const sql = getDatabase();
  const images = await sql`
   SELECT
    imgtype,
    encode(imgdata, 'base64') AS imgbase64
   FROM img
   WHERE lower(imgname) = lower(${requestedName})
   ORDER BY imgpk
   LIMIT 1
  `;

  if (images.length === 0) {
   return new Response('Image not found.', { status: 404 });
  }

  const image = images[0];
  const imageBuffer = Buffer.from(image.imgbase64, 'base64');

  return new Response(imageBuffer, {
   headers: {
    'Content-Type': image.imgtype,
    'Content-Length': String(imageBuffer.length),
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
   },
  });
 } catch (error) {
  console.error('Unable to serve image by name:', error);
  return new Response('Unable to load image.', { status: 500 });
 }
}
