/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTO_SCROLL_SPEED = 0.35;

const MediaCard = ({ item, itemKey, onOpen, shouldPlay }) => {
 const videoRef = useRef(null);
 const cardRef = useRef(null);

 useEffect(() => {
  if (item.type !== 'video') return undefined;

  const video = videoRef.current;
  const card = cardRef.current;
  if (!video || !card) return undefined;

  const observer = new IntersectionObserver(
   ([entry]) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && shouldPlay) {
     video.play().catch(() => {});
    } else {
     video.pause();
    }
   },
   { threshold: [0, 0.6, 1] },
  );

  observer.observe(card);
  return () => {
   observer.disconnect();
   video.pause();
  };
 }, [item.type, shouldPlay]);

 useEffect(() => {
  if (item.type === 'video' && !shouldPlay) videoRef.current?.pause();
 }, [item.type, shouldPlay]);

 return (
  <button
   ref={cardRef}
   type="button"
   className="media-card"
   onClick={() => onOpen(item)}
   aria-label={`Open ${item.type === 'video' ? 'video' : 'photo'} ${item.name || ''}`.trim()}
   data-media-key={itemKey}
  >
   {item.type === 'video' ? (
    <video
     ref={videoRef}
     src={item.src}
     muted
     loop
     playsInline
     preload="none"
     aria-hidden="true"
    />
   ) : (
    <img src={item.src} alt={item.name || 'DJ Volts event photo'} loading="lazy" decoding="async" />
   )}
   <span className="media-card-type" aria-hidden="true">{item.type === 'video' ? '▶' : '⤢'}</span>
  </button>
 );
};

export const Gallery = ({ mediaItems }) => {
 const [selectedIndex, setSelectedIndex] = useState(null);
 const [isInteracting, setIsInteracting] = useState(false);
 const [isPageVisible, setIsPageVisible] = useState(true);
 const trackRef = useRef(null);
 const animationRef = useRef(null);
 const closeButtonRef = useRef(null);
 const touchStart = useRef({ x: 0, y: 0 });

 const repeatedItems = useMemo(() => {
  if (mediaItems.length <= 1) return mediaItems;
  return [...mediaItems, ...mediaItems, ...mediaItems];
 }, [mediaItems]);

 const selectedItem = selectedIndex === null ? null : mediaItems[selectedIndex];
 const shouldPlayInline = isPageVisible && selectedIndex === null;


 useEffect(() => {
  const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
 }, []);

 useEffect(() => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1) return undefined;

  const positionAtMiddleSet = () => {
   const setWidth = track.scrollWidth / 3;
   if (setWidth > 0) track.scrollLeft = setWidth;
  };

  const initialTimer = window.setTimeout(positionAtMiddleSet, 0);
  window.addEventListener('resize', positionAtMiddleSet);

  return () => {
   window.clearTimeout(initialTimer);
   window.removeEventListener('resize', positionAtMiddleSet);
  };
 }, [mediaItems.length]);

 useEffect(() => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1 || isInteracting || selectedIndex !== null) return undefined;

  const animate = () => {
   const setWidth = track.scrollWidth / 3;
   if (setWidth > 0) {
    track.scrollLeft += AUTO_SCROLL_SPEED;
    if (track.scrollLeft >= setWidth * 2) track.scrollLeft -= setWidth;
   }
   animationRef.current = window.requestAnimationFrame(animate);
  };

  animationRef.current = window.requestAnimationFrame(animate);
  return () => window.cancelAnimationFrame(animationRef.current);
 }, [isInteracting, mediaItems.length, selectedIndex]);

 const maintainEndlessLoop = () => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1) return;

  const setWidth = track.scrollWidth / 3;
  if (setWidth <= 0) return;

  if (track.scrollLeft < setWidth * 0.25) {
   track.scrollLeft += setWidth;
  } else if (track.scrollLeft > setWidth * 2.75) {
   track.scrollLeft -= setWidth;
  }
 };

 const nudgeGallery = (direction) => {
  const track = trackRef.current;
  if (!track) return;
  const card = track.querySelector('.media-card');
  const distance = card ? card.getBoundingClientRect().width + 16 : 340;
  track.scrollBy({ left: distance * direction, behavior: 'smooth' });
 };

 const closeViewer = () => setSelectedIndex(null);

 const changeViewerItem = useCallback((direction) => {
  setSelectedIndex((current) => {
   if (current === null || mediaItems.length === 0) return current;
   return (current + direction + mediaItems.length) % mediaItems.length;
  });
 }, [mediaItems.length]);

 useEffect(() => {
  if (selectedIndex === null) {
   document.body.classList.remove('lightbox-locked');
   return undefined;
  }

  document.body.classList.add('lightbox-locked');
  closeButtonRef.current?.focus();

  const handleKeyDown = (event) => {
   if (event.key === 'Escape') closeViewer();
   if (event.key === 'ArrowLeft') changeViewerItem(-1);
   if (event.key === 'ArrowRight') changeViewerItem(1);
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
   document.removeEventListener('keydown', handleKeyDown);
   document.body.classList.remove('lightbox-locked');
  };
 }, [selectedIndex, changeViewerItem]);

 const openItem = (item) => {
  const index = mediaItems.findIndex((candidate) => candidate.key === item.key);
  if (index >= 0) setSelectedIndex(index);
 };

 const handleTouchStart = (event) => {
  const touch = event.touches[0];
  touchStart.current = { x: touch.clientX, y: touch.clientY };
 };

 const handleTouchEnd = (event) => {
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStart.current.x;
  const deltaY = touch.clientY - touchStart.current.y;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
   changeViewerItem(deltaX < 0 ? 1 : -1);
  }
 };

 return (
  <>
   <section className="gallery" id="gallery">
    <div className="wrap">
     <div className="section-head gallery-heading">
      <span className="kicker">Gallery</span>
      <h2>From the booth & dance floor.</h2>
      <p>Photos and live footage from recent sets — click any moment to see it full size.</p>
     </div>

     {mediaItems.length > 0 ? (
      <div className="media-gallery-shell">
       {mediaItems.length > 1 && <button type="button" className="media-gallery-arrow media-gallery-prev" onClick={() => nudgeGallery(-1)} aria-label="Scroll gallery left">‹</button>}
       <div
        ref={trackRef}
        className="media-gallery-track"
        onScroll={maintainEndlessLoop}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={() => setIsInteracting(false)}
        onPointerCancel={() => setIsInteracting(false)}
        onFocusCapture={() => setIsInteracting(true)}
        onBlurCapture={(event) => {
         if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false);
        }}
       >
        {repeatedItems.map((item, index) => (
         <MediaCard
          key={`${item.key}-${index}`}
          item={item}
          itemKey={`${item.key}-${index}`}
          onOpen={openItem}
          shouldPlay={shouldPlayInline}
         />
        ))}
       </div>
       {mediaItems.length > 1 && <button type="button" className="media-gallery-arrow media-gallery-next" onClick={() => nudgeGallery(1)} aria-label="Scroll gallery right">›</button>}
      </div>
     ) : (
      <p className="media-gallery-empty">Gallery media is coming soon.</p>
     )}
    </div>
   </section>

   {selectedItem && (
    <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Gallery viewer" onClick={(event) => {
     if (event.target === event.currentTarget) closeViewer();
    }}>
     <button ref={closeButtonRef} type="button" className="lightbox-close" onClick={closeViewer} aria-label="Close gallery viewer">✕</button>
     {mediaItems.length > 1 && (
      <>
       <button type="button" className="lightbox-nav lightbox-prev" onClick={() => changeViewerItem(-1)} aria-label="Previous gallery item">‹</button>
       <button type="button" className="lightbox-nav lightbox-next" onClick={() => changeViewerItem(1)} aria-label="Next gallery item">›</button>
      </>
     )}
     <div className="lightbox-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {selectedItem.type === 'video' ? (
       <video
        key={selectedItem.key}
        className="lightbox-media"
        src={selectedItem.src}
        controls
        autoPlay
        playsInline
        preload="metadata"
       />
      ) : (
       <img className="lightbox-media" src={selectedItem.src} alt={selectedItem.name || 'DJ Volts event photo'} />
      )}
     </div>
    </div>
   )}
  </>
 );
};
