import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
 try {
  const { imgPk } = await params;
  const imageId = Number(imgPk);

  if (!Number.isInteger(imageId) || imageId < 1) {
   return new Response('Invalid image ID.', { status: 400 });
  }

  const sql = getDatabase();
  const images = await sql`
   SELECT
    imgtype,
    encode(imgdata, 'base64') AS imgbase64
   FROM img
   WHERE imgpk = ${imageId}
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
  console.error('Unable to serve gallery image:', error);
  return new Response('Unable to load image.', { status: 500 });
 }
}
