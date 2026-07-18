import { Djvolts } from '@/comps/djvolts/djvolts';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getGalleryMedia() {
 try {
  const sql = getDatabase();
  const media = await sql`
   SELECT imgpk AS id, 'image' AS type, sortid
   FROM img
   WHERE COALESCE(isgallery, TRUE) = TRUE

   UNION ALL

   SELECT vidpk AS id, 'video' AS type, sortid
   FROM vid
   WHERE COALESCE(isgallery, TRUE) = TRUE

   ORDER BY sortid, type, id
  `;

  return media.map((item) => ({
   key: `${item.type}-${item.id}`,
   id: item.id,
   type: item.type,
   src: item.type === 'video'
    ? `/api/videos/id/${item.id}`
    : `/api/images/${item.id}`,
  }));
 } catch (error) {
  console.error('Unable to load gallery media from the database:', error);
  return [];
 }
}

export default async function Home() {
 const galleryMedia = await getGalleryMedia();
 return <Djvolts galleryMedia={galleryMedia} />;
}
