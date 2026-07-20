import { Djvolts } from '@/comps/djvolts/djvolts';
import { getDatabase } from '@/lib/db';
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

async function getGalleryMedia() {
 try {
  const sql = getDatabase();
  const media = await sql`
   SELECT imgpk AS id, 'image' AS type, sortid FROM img WHERE COALESCE(isgallery, TRUE) = TRUE
   UNION ALL
   SELECT vidpk AS id, 'video' AS type, sortid FROM vid WHERE COALESCE(isgallery, TRUE) = TRUE
   ORDER BY sortid, type, id
  `;
  return media.map((item) => ({ key: `${item.type}-${item.id}`, id: item.id, type: item.type, src: item.type === 'video' ? `/api/videos/id/${item.id}` : `/api/images/${item.id}` }));
 } catch (error) { console.error('Unable to load gallery media:', error); return []; }
}

async function getContent() {
 try {
  const sql = getDatabase();
  await sql`ALTER TABLE settings ADD COLUMN IF NOT EXISTS content JSONB`;
  const rows = await sql`SELECT content FROM settings ORDER BY settingpk LIMIT 1`;
  return mergeSiteContent(rows[0]?.content || {});
 } catch (error) { console.error('Unable to load content:', error); return DEFAULT_SITE_CONTENT; }
}

async function getMediaSettings() {
 try {
  const sql = getDatabase();
  const rows = await sql`
   SELECT
    COALESCE(enableherovideo, TRUE) AS enableherovideo,
    COALESCE(enablebackgroundvideo, TRUE) AS enablebackgroundvideo,
    COALESCE(enableheroposter, TRUE) AS enableheroposter,
    COALESCE(enablebackgroundposter, TRUE) AS enablebackgroundposter
   FROM settings
   ORDER BY settingpk
   LIMIT 1
  `;
  const row = rows[0] || {};
  return {
   enableHeroVideo: row.enableherovideo ?? true,
   enableBackgroundVideo: row.enablebackgroundvideo ?? true,
   enableHeroPoster: row.enableheroposter ?? true,
   enableBackgroundPoster: row.enablebackgroundposter ?? true,
  };
 } catch (error) {
  console.error('Unable to load media settings:', error);
  return {
   enableHeroVideo: true,
   enableBackgroundVideo: true,
   enableHeroPoster: true,
   enableBackgroundPoster: true,
  };
 }
}

export default async function Home() {
 const [galleryMedia, content, mediaSettings] = await Promise.all([getGalleryMedia(), getContent(), getMediaSettings()]);
 return <Djvolts galleryMedia={galleryMedia} content={content} mediaSettings={mediaSettings} />;
}
