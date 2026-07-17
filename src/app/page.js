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

export default async function Home() {
 const galleryImages = await getGalleryImages();

 return <Djvolts galleryImages={galleryImages} />;
}
