import { Djvolts } from '@/comps/djvolts/djvolts';
import { getDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getGalleryImages() {
 try {
  const sql = getDatabase();
  const images = await sql`
   SELECT imgpk
   FROM img
   ORDER BY sortid, imgpk
  `;

  return images.map((image) => `/api/images/${image.imgpk}`);
 } catch (error) {
  console.error('Unable to load gallery images from the database:', error);
  return [];
 }
}

async function getLiveFootageVideos() {
 try {
  const sql = getDatabase();
  const videos = await sql`
   SELECT vidpk, vidname
   FROM vid
   WHERE islivefootage = TRUE
   ORDER BY sortid, vidpk
  `;

  return videos.map((video) => ({
   id: video.vidpk,
   name: video.vidname,
   src: `/api/videos/id/${video.vidpk}`,
  }));
 } catch (error) {
  console.error('Unable to load live footage videos from the database:', error);
  return [];
 }
}

export default async function Home() {
 const [galleryImages, liveFootageVideos] = await Promise.all([
  getGalleryImages(),
  getLiveFootageVideos(),
 ]);

 return <Djvolts galleryImages={galleryImages} liveFootageVideos={liveFootageVideos} />;
}
