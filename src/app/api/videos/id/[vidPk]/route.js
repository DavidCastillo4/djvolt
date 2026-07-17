import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';

const DEFAULT_CHUNK_SIZE = 1024 * 1024;
const MAX_CHUNK_SIZE = 4 * 1024 * 1024;

function getRange(rangeHeader, totalSize) {
 if (!rangeHeader) return null;

 const match = /^bytes=(\d+)-(\d*)$/i.exec(rangeHeader.trim());
 if (!match) return { invalid: true };

 const start = Number(match[1]);
 const requestedEnd = match[2] ? Number(match[2]) : null;

 if (!Number.isSafeInteger(start) || start < 0 || start >= totalSize) {
  return { invalid: true };
 }

 const end = requestedEnd === null
  ? Math.min(start + DEFAULT_CHUNK_SIZE - 1, totalSize - 1)
  : Math.min(requestedEnd, start + MAX_CHUNK_SIZE - 1, totalSize - 1);

 if (!Number.isSafeInteger(end) || end < start) return { invalid: true };
 return { start, end };
}

export async function GET(request, { params }) {
 try {
  const { vidPk } = await params;
  const videoId = Number(vidPk);

  if (!Number.isInteger(videoId) || videoId < 1) {
   return new Response('Invalid video ID.', { status: 400 });
  }

  const sql = getDatabase();
  const videos = await sql`
   SELECT vidpk, vidtype, octet_length(viddata) AS videosize
   FROM vid
   WHERE vidpk = ${videoId}
     AND islivefootage = TRUE
   LIMIT 1
  `;

  if (videos.length === 0) {
   return new Response('Video not found.', { status: 404 });
  }

  const video = videos[0];
  const totalSize = Number(video.videosize);
  const range = getRange(request.headers.get('range'), totalSize);

  if (range?.invalid) {
   return new Response(null, {
    status: 416,
    headers: {
     'Content-Range': `bytes */${totalSize}`,
     'Accept-Ranges': 'bytes',
    },
   });
  }

  if (!range) {
   const rows = await sql`
    SELECT encode(viddata, 'base64') AS vidbase64
    FROM vid
    WHERE vidpk = ${videoId}
   `;
   const videoBuffer = Buffer.from(rows[0].vidbase64, 'base64');

   return new Response(videoBuffer, {
    status: 200,
    headers: {
     'Content-Type': video.vidtype,
     'Content-Length': String(videoBuffer.length),
     'Accept-Ranges': 'bytes',
     'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
   });
  }

  const chunkLength = range.end - range.start + 1;
  const rows = await sql`
   SELECT encode(substring(viddata FROM ${range.start + 1} FOR ${chunkLength}), 'base64') AS vidbase64
   FROM vid
   WHERE vidpk = ${videoId}
  `;
  const videoChunk = Buffer.from(rows[0].vidbase64, 'base64');

  return new Response(videoChunk, {
   status: 206,
   headers: {
    'Content-Type': video.vidtype,
    'Content-Length': String(videoChunk.length),
    'Content-Range': `bytes ${range.start}-${range.end}/${totalSize}`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
   },
  });
 } catch (error) {
  console.error('Unable to serve live footage video:', error);
  return new Response('Unable to load video.', { status: 500 });
 }
}
