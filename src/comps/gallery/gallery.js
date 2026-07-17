/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const getImagesPerPage = () => {
 if (typeof window === 'undefined') return 8;
 if (window.innerWidth <= 560) return 4;
 if (window.innerWidth <= 900) return 6;
 return 8;
};

export const Gallery = ({ images }) => {
 const [galleryPage, setGalleryPage] = useState(0);
 const [imagesPerPage, setImagesPerPage] = useState(8);
 const [isTransitioning, setIsTransitioning] = useState(false);
 const [selectedImageIndex, setSelectedImageIndex] = useState(null);
 const transitionTimer = useRef(null);
 const touchStart = useRef({ x: 0, y: 0 });
 const closeButtonRef = useRef(null);

 useEffect(() => {
  const updateImagesPerPage = () => setImagesPerPage(getImagesPerPage());
  updateImagesPerPage();
  window.addEventListener('resize', updateImagesPerPage);
  return () => window.removeEventListener('resize', updateImagesPerPage);
 }, []);

 const pageCount = Math.max(1, Math.ceil(images.length / imagesPerPage));
 const visibleImages = useMemo(() => {
  const startIndex = galleryPage * imagesPerPage;
  return images.slice(startIndex, startIndex + imagesPerPage).map((src, index) => ({
   src,
   imageIndex: startIndex + index,
  }));
 }, [galleryPage, images, imagesPerPage]);

 useEffect(() => {
  if (galleryPage >= pageCount) setGalleryPage(0);
 }, [galleryPage, pageCount]);

 useEffect(() => () => {
  if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
 }, []);

 const changePage = (direction) => {
  if (isTransitioning || pageCount <= 1) return;
  setIsTransitioning(true);
  transitionTimer.current = window.setTimeout(() => {
   setGalleryPage((currentPage) => (currentPage + direction + pageCount) % pageCount);
   requestAnimationFrame(() => setIsTransitioning(false));
  }, 180);
 };

 const closeLightbox = () => setSelectedImageIndex(null);
 const changeLightboxImage = useCallback((direction) => {
  setSelectedImageIndex((currentIndex) => (currentIndex + direction + images.length) % images.length);
 }, [images.length]);

 useEffect(() => {
  if (selectedImageIndex === null) {
   document.body.classList.remove('lightbox-locked');
   return undefined;
  }

  document.body.classList.add('lightbox-locked');
  closeButtonRef.current?.focus();

  const handleKeyDown = (event) => {
   if (event.key === 'Escape') closeLightbox();
   if (event.key === 'ArrowLeft') changeLightboxImage(-1);
   if (event.key === 'ArrowRight') changeLightboxImage(1);
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
   document.removeEventListener('keydown', handleKeyDown);
   document.body.classList.remove('lightbox-locked');
  };
 }, [selectedImageIndex, changeLightboxImage]);

 const handleTouchStart = (event) => {
  const touch = event.touches[0];
  touchStart.current = { x: touch.clientX, y: touch.clientY };
 };

 const handleTouchEnd = (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.current.x;
  const deltaY = touch.clientY - touchStart.current.y;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
   changeLightboxImage(deltaX < 0 ? 1 : -1);
  }
 };

 return (
  <>
   <section className="gallery" id="gallery">
    <div className="wrap">
     <div className="section-head">
      <span className="kicker">Gallery</span>
      <h2>From the booth & dance floor.</h2>
      <p>A few shots from recent sets — string lights, packed floors, and the rig that makes it all run.</p>
     </div>
     <div className={`gallery-grid gallery-pattern-${(galleryPage % 3) + 1} gallery-count-${visibleImages.length}${isTransitioning ? ' is-transitioning' : ''}`}>
      {visibleImages.map(({ src, imageIndex }, index) => (
       <figure
        className={`gallery-item gallery-item-${index + 1}`}
        key={src}
        tabIndex="0"
        role="button"
        aria-label={`View larger photo ${imageIndex + 1}`}
        onClick={() => setSelectedImageIndex(imageIndex)}
        onKeyDown={(event) => {
         if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setSelectedImageIndex(imageIndex);
         }
        }}
       >
        <img src={src} alt={`DJ Volts event photo ${imageIndex + 1}`} loading="lazy" decoding="async" />
        <span className="gallery-zoom" aria-hidden="true">⤢</span>
       </figure>
      ))}
     </div>
     {pageCount > 1 && (
      <div className="gallery-controls" aria-label="Gallery navigation">
       <button type="button" onClick={() => changePage(-1)} aria-label="Previous group of photos">‹</button>
       <button type="button" onClick={() => changePage(1)} aria-label="Next group of photos">›</button>
      </div>
     )}
    </div>
   </section>

   {selectedImageIndex !== null && images.length > 0 && (
    <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Photo gallery viewer" onClick={(event) => {
     if (event.target === event.currentTarget) closeLightbox();
    }}>
     <button ref={closeButtonRef} type="button" className="lightbox-close" onClick={closeLightbox} aria-label="Close gallery viewer">✕</button>
     <button type="button" className="lightbox-nav lightbox-prev" onClick={() => changeLightboxImage(-1)} aria-label="Previous photo">‹</button>
     <button type="button" className="lightbox-nav lightbox-next" onClick={() => changeLightboxImage(1)} aria-label="Next photo">›</button>
     <div className="lightbox-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <img className="lightbox-img show" src={images[selectedImageIndex]} alt={`DJ Volts event photo ${selectedImageIndex + 1}`} />
     </div>
     <div className="lightbox-meta"><span className="lightbox-counter">{selectedImageIndex + 1} / {images.length}</span></div>
     <div className="lightbox-filmstrip">
      {images.map((src, index) => (
       <button
        type="button"
        className={`lightbox-thumb${index === selectedImageIndex ? ' active' : ''}`}
        key={src}
        onClick={() => setSelectedImageIndex(index)}
        aria-label={`Go to photo ${index + 1}`}
       >
        <img src={src} alt="" loading="lazy" />
       </button>
      ))}
     </div>
    </div>
   )}
  </>
 );
};
