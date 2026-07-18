import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
 try {
  const { posterRole } = await params;

  if (posterRole !== 'hero' && posterRole !== 'background') {
   return new Response('Poster not found.', { status: 404 });
  }

  const sql = getDatabase();
  const rows = posterRole === 'hero'
   ? await sql`
      SELECT encode(heroposter, 'base64') AS posterbase64
      FROM settings
      WHERE heroposter IS NOT NULL
      ORDER BY settingpk
      LIMIT 1
     `
   : await sql`
      SELECT encode(backgroundposter, 'base64') AS posterbase64
      FROM settings
      WHERE backgroundposter IS NOT NULL
      ORDER BY settingpk
      LIMIT 1
     `;

  if (rows.length === 0 || !rows[0].posterbase64) {
   return new Response('Poster not found.', { status: 404 });
  }

  const posterBuffer = Buffer.from(rows[0].posterbase64, 'base64');

  return new Response(posterBuffer, {
   status: 200,
   headers: {
    'Content-Type': 'image/jpeg',
    'Content-Length': String(posterBuffer.length),
    'Cache-Control': 'no-store',
   },
  });
 } catch (error) {
  console.error('Unable to serve video poster:', error);
  return new Response('Unable to load poster.', { status: 500 });
 }
}
