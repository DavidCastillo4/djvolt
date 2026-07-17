import fs from 'fs';
import path from 'path';

import { Djvolts } from '@/comps/djvolts/djvolts';

const supportedImageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

function getGalleryImages() {
 const imagesDirectory = path.join(process.cwd(), 'public', 'assets', 'images');

 try {
  return fs
   .readdirSync(imagesDirectory, { withFileTypes: true })
   .filter((entry) => entry.isFile() && supportedImageExtensions.has(path.extname(entry.name).toLowerCase()))
   .map((entry) => entry.name)
   .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
   .map((fileName) => `/assets/images/${encodeURIComponent(fileName)}`);
 } catch (error) {
  console.error('Unable to read gallery images:', error);
  return [];
 }
}

export default function Home() {
 const galleryImages = getGalleryImages();

 return <Djvolts galleryImages={galleryImages} />;
}
