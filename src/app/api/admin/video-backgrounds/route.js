import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { ADMIN_COOKIE_NAME, getAdminSessionValue } from '@/lib/adminAuth';
import { getDatabase } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_POSTER_BYTES = 2 * 1024 * 1024;
const JPEG_DATA_URL_PREFIX = 'data:image/jpeg;base64,';

async function isAuthorized() {
 const cookieStore = await cookies();
 return cookieStore.get(ADMIN_COOKIE_NAME)?.value === getAdminSessionValue();
}

function unauthorized() {
 return NextResponse.json({ message: 'Your admin session has expired.' }, { status: 401 });
}

async function ensureMediaSettingColumns(sql) {
 await sql`
  ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS enableherovideo BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enablebackgroundvideo BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enableheroposter BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enablebackgroundposter BOOLEAN NOT NULL DEFAULT TRUE
 `;
}

function decodePoster(dataUrl) {
 if (typeof dataUrl !== 'string' || !dataUrl.startsWith(JPEG_DATA_URL_PREFIX)) {
  throw new Error('A valid JPEG poster was not supplied.');
 }

 const poster = Buffer.from(dataUrl.slice(JPEG_DATA_URL_PREFIX.length), 'base64');
 if (poster.length < 4 || poster.length > MAX_POSTER_BYTES) {
  throw new Error('The generated poster is invalid or too large.');
 }

 if (poster[0] !== 0xff || poster[1] !== 0xd8 || poster[poster.length - 2] !== 0xff || poster[poster.length - 1] !== 0xd9) {
  throw new Error('The generated poster is not a valid JPEG image.');
 }

 return poster;
}

const asBoolean = (value, fallback = true) => typeof value === 'boolean' ? value : fallback;

export async function GET() {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const sql = getDatabase();
  await ensureMediaSettingColumns(sql);

  const [rows, settingsRows] = await Promise.all([
   sql`
    SELECT
     vidpk,
     sortid,
     COALESCE(ishero, FALSE) AS ishero,
     COALESCE(isbackground, FALSE) AS isbackground
    FROM vid
    ORDER BY sortid, vidpk
   `,
   sql`
    SELECT
     COALESCE(enableherovideo, TRUE) AS enableherovideo,
     COALESCE(enablebackgroundvideo, TRUE) AS enablebackgroundvideo,
     COALESCE(enableheroposter, TRUE) AS enableheroposter,
     COALESCE(enablebackgroundposter, TRUE) AS enablebackgroundposter
    FROM settings
    ORDER BY settingpk
    LIMIT 1
   `,
  ]);

  const settings = settingsRows[0] || {};
  return NextResponse.json({
   videos: rows.map((row) => ({
    id: Number(row.vidpk),
    sortId: Number(row.sortid),
    isHero: Boolean(row.ishero),
    isBackground: Boolean(row.isbackground),
    src: `/api/videos/id/${row.vidpk}`,
   })),
   settings: {
    enableHeroVideo: settings.enableherovideo ?? true,
    enableBackgroundVideo: settings.enablebackgroundvideo ?? true,
    enableHeroPoster: settings.enableheroposter ?? true,
    enableBackgroundPoster: settings.enablebackgroundposter ?? true,
   },
  });
 } catch (error) {
  console.error('Unable to load video backgrounds:', error);
  return NextResponse.json({ message: 'Unable to load the videos.' }, { status: 500 });
 }
}

export async function POST(request) {
 try {
  if (!(await isAuthorized())) return unauthorized();

  const body = await request.json();
  const heroId = Number(body.heroId);
  const backgroundId = Number(body.backgroundId);
  const enableHeroVideo = asBoolean(body.enableHeroVideo);
  const enableBackgroundVideo = asBoolean(body.enableBackgroundVideo);
  const enableHeroPoster = asBoolean(body.enableHeroPoster);
  const enableBackgroundPoster = asBoolean(body.enableBackgroundPoster);

  if (!Number.isInteger(heroId) || heroId < 1 || !Number.isInteger(backgroundId) || backgroundId < 1) {
   return NextResponse.json({ message: 'Choose both a hero video and a page-background video.' }, { status: 400 });
  }

  let heroPoster;
  let backgroundPoster;
  try {
   heroPoster = decodePoster(body.heroPoster);
   backgroundPoster = heroId === backgroundId ? heroPoster : decodePoster(body.backgroundPoster);
  } catch (posterError) {
   return NextResponse.json({ message: posterError.message }, { status: 400 });
  }

  const sql = getDatabase();
  await ensureMediaSettingColumns(sql);

  const selectedRows = await sql`
   SELECT vidpk
   FROM vid
   WHERE vidpk IN (${heroId}, ${backgroundId})
  `;
  const selectedIds = new Set(selectedRows.map((row) => Number(row.vidpk)));

  if (!selectedIds.has(heroId) || !selectedIds.has(backgroundId)) {
   return NextResponse.json({ message: 'One of the selected videos no longer exists.' }, { status: 404 });
  }

  await sql`
   UPDATE vid
   SET ishero = FALSE,
       isbackground = FALSE
   WHERE ishero = TRUE OR isbackground = TRUE
  `;

  await sql`
   UPDATE vid
   SET ishero = (vidpk = ${heroId}),
       isbackground = (vidpk = ${backgroundId})
   WHERE vidpk IN (${heroId}, ${backgroundId})
  `;

  const updatedSettings = await sql`
   UPDATE settings
   SET heroposter = ${heroPoster},
       backgroundposter = ${backgroundPoster},
       enableherovideo = ${enableHeroVideo},
       enablebackgroundvideo = ${enableBackgroundVideo},
       enableheroposter = ${enableHeroPoster},
       enablebackgroundposter = ${enableBackgroundPoster}
   RETURNING settingpk
  `;

  if (updatedSettings.length === 0) {
   return NextResponse.json({ message: 'The settings record could not be found.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
 } catch (error) {
  console.error('Unable to save video backgrounds:', error);
  return NextResponse.json({ message: 'Unable to save the video-background settings.' }, { status: 500 });
 }
}
