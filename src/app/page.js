import { Djvolts } from '@/comps/djvolts/djvolts';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getGalleryMedia() {
 try {
  const sql = getDatabase();
  const media = await sql`
   SELECT imgpk AS id, imgname AS name, 'image' AS type, sortid
   FROM img

   UNION ALL

   SELECT vidpk AS id, vidname AS name, 'video' AS type, sortid
   FROM vid
   WHERE islivefootage = TRUE

   ORDER BY sortid, type, id
  `;

  return media.map((item) => ({
   key: `${item.type}-${item.id}`,
   id: item.id,
   name: item.name,
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
