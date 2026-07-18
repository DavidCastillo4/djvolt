/* eslint-disable @next/next/no-img-element */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTO_SCROLL_PIXELS_PER_SECOND = 12;

const MediaCard = ({ item, itemKey, onOpen }) => (
  <button
   type="button"
   className="media-card"
   onClick={() => onOpen(item)}
   aria-label={`Open ${item.type === 'video' ? 'video' : 'photo'}`}
   data-media-key={itemKey}
  >
   {item.type === 'video' ? (
    <video
     src={item.src}
     muted
     loop
     playsInline
     preload="auto"
     aria-hidden="true"
    />
   ) : (
    <img src={item.src} alt="DJ Volts event photo" loading="lazy" decoding="async" />
   )}
   <span className="media-card-type" aria-hidden="true">{item.type === 'video' ? '▶' : '⤢'}</span>
  </button>
);

export const Gallery = ({ mediaItems, content }) => {
 const [selectedIndex, setSelectedIndex] = useState(null);
 const [isInteracting, setIsInteracting] = useState(false);
 const [isPageVisible, setIsPageVisible] = useState(true);
 const trackRef = useRef(null);
 const animationRef = useRef(null);
 const resumeTimerRef = useRef(null);
 const lastFrameTimeRef = useRef(null);
 const lastPlaybackSyncRef = useRef(0);
 const scrollPositionRef = useRef(0);
 const closeButtonRef = useRef(null);
 const touchStart = useRef({ x: 0, y: 0 });

 const repeatedSets = useMemo(() => {
  if (mediaItems.length <= 1) return [mediaItems];
  return [mediaItems, mediaItems, mediaItems];
 }, [mediaItems]);

 const selectedItem = selectedIndex === null ? null : mediaItems[selectedIndex];
 const shouldPlayInline = isPageVisible && selectedIndex === null;

 const syncInlineVideoPlayback = useCallback(() => {
  const track = trackRef.current;
  if (!track) return;

  const trackRect = track.getBoundingClientRect();
  const horizontalBuffer = trackRect.width * 0.25;

  track.querySelectorAll('.media-card video').forEach((video) => {
   const card = video.closest('.media-card');
   if (!card) return;

   const cardRect = card.getBoundingClientRect();
   const isNearViewport = (
    cardRect.right >= trackRect.left - horizontalBuffer
    && cardRect.left <= trackRect.right + horizontalBuffer
   );

   if (shouldPlayInline && isNearViewport) {
    if (video.paused) video.play().catch(() => {});
   } else if (!video.paused) {
    video.pause();
   }
  });
 }, [shouldPlayInline]);


 useEffect(() => {
  const handleVisibilityChange = () => setIsPageVisible(!document.hidden);
  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
 }, []);

 useEffect(() => {
  const track = trackRef.current;
  if (!track) return undefined;

  const handleMediaReady = () => syncInlineVideoPlayback();
  const frame = window.requestAnimationFrame(syncInlineVideoPlayback);

  track.addEventListener('loadeddata', handleMediaReady, true);
  track.addEventListener('canplay', handleMediaReady, true);

  return () => {
   window.cancelAnimationFrame(frame);
   track.removeEventListener('loadeddata', handleMediaReady, true);
   track.removeEventListener('canplay', handleMediaReady, true);
   track.querySelectorAll('.media-card video').forEach((video) => video.pause());
  };
 }, [mediaItems, syncInlineVideoPlayback]);

 useEffect(() => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1) return undefined;

  const positionAtMiddleSet = () => {
   const firstSet = track.querySelector('.media-gallery-set');
   if (!firstSet) return;
   const setWidth = firstSet.getBoundingClientRect().width + 16;
   if (setWidth > 0) {
    scrollPositionRef.current = setWidth;
    track.scrollLeft = setWidth;
    window.requestAnimationFrame(syncInlineVideoPlayback);
   }
  };

  const initialTimer = window.setTimeout(positionAtMiddleSet, 50);
  window.addEventListener('resize', positionAtMiddleSet);

  return () => {
   window.clearTimeout(initialTimer);
   window.removeEventListener('resize', positionAtMiddleSet);
  };
 }, [mediaItems.length, syncInlineVideoPlayback]);

 useEffect(() => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1 || isInteracting || selectedIndex !== null) {
   lastFrameTimeRef.current = null;
   return undefined;
  }

  const animate = (timestamp) => {
   const firstSet = track.querySelector('.media-gallery-set');
   if (!firstSet) {
    animationRef.current = window.requestAnimationFrame(animate);
    return;
   }

   const setWidth = firstSet.getBoundingClientRect().width + 16;
   const previousTimestamp = lastFrameTimeRef.current ?? timestamp;
   const elapsedSeconds = Math.min((timestamp - previousTimestamp) / 1000, 0.05);
   lastFrameTimeRef.current = timestamp;

   if (setWidth > 0) {
    scrollPositionRef.current += AUTO_SCROLL_PIXELS_PER_SECOND * elapsedSeconds;

    if (scrollPositionRef.current >= setWidth * 2) {
     scrollPositionRef.current -= setWidth;
    }

    track.scrollLeft = scrollPositionRef.current;
   }

   if (timestamp - lastPlaybackSyncRef.current >= 250) {
    lastPlaybackSyncRef.current = timestamp;
    syncInlineVideoPlayback();
   }

   animationRef.current = window.requestAnimationFrame(animate);
  };

  animationRef.current = window.requestAnimationFrame(animate);
  return () => {
   window.cancelAnimationFrame(animationRef.current);
   lastFrameTimeRef.current = null;
  };
 }, [isInteracting, mediaItems.length, selectedIndex, syncInlineVideoPlayback]);

 const getSetWidth = () => {
  const track = trackRef.current;
  const firstSet = track?.querySelector('.media-gallery-set');
  if (!track || !firstSet) return 0;
  return firstSet.getBoundingClientRect().width + 16;
 };

 const maintainEndlessLoop = () => {
  const track = trackRef.current;
  if (!track || mediaItems.length <= 1) return;

  const setWidth = getSetWidth();
  if (setWidth <= 0) return;

  let nextPosition = track.scrollLeft;

  if (nextPosition < setWidth * 0.5) {
   nextPosition += setWidth;
  } else if (nextPosition >= setWidth * 2.5) {
   nextPosition -= setWidth;
  }

  scrollPositionRef.current = nextPosition;
  if (track.scrollLeft !== nextPosition) {
   track.scrollLeft = nextPosition;
   window.requestAnimationFrame(syncInlineVideoPlayback);
  }
 };

 const pauseThenResume = () => {
  setIsInteracting(true);
  syncInlineVideoPlayback();
  window.clearTimeout(resumeTimerRef.current);
  resumeTimerRef.current = window.setTimeout(() => setIsInteracting(false), 1400);
 };

 const nudgeGallery = (direction) => {
  const track = trackRef.current;
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.media-card'));
  if (cards.length === 0) return;

  pauseThenResume();

  const viewportCenter = track.scrollLeft + (track.clientWidth / 2);
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  cards.forEach((card, index) => {
   const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
   const distance = Math.abs(cardCenter - viewportCenter);
   if (distance < closestDistance) {
    closestDistance = distance;
    closestIndex = index;
   }
  });

  const targetIndex = Math.max(0, Math.min(cards.length - 1, closestIndex + direction));
  const targetCard = cards[targetIndex];
  const targetLeft = targetCard.offsetLeft + (targetCard.offsetWidth / 2) - (track.clientWidth / 2);

  scrollPositionRef.current = targetLeft;
  track.scrollTo({ left: targetLeft, behavior: 'smooth' });
  window.setTimeout(syncInlineVideoPlayback, 350);
 };

 useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

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
      <span className="kicker">{content.kicker}</span>
      <h2>{content.heading}</h2>
      <p>{content.intro}</p>
     </div>

     {mediaItems.length > 0 ? (
      <div className="media-gallery-shell">
       {mediaItems.length > 1 && <button type="button" className="media-gallery-arrow media-gallery-prev" onClick={() => nudgeGallery(-1)} aria-label="Scroll gallery left">‹</button>}
       <div
        ref={trackRef}
        className="media-gallery-track"
        onScroll={() => {
         scrollPositionRef.current = trackRef.current?.scrollLeft ?? 0;
         maintainEndlessLoop();
        }}
        onPointerDown={() => setIsInteracting(true)}
        onPointerUp={pauseThenResume}
        onPointerCancel={pauseThenResume}
       >
        {repeatedSets.map((setItems, setIndex) => (
         <div className="media-gallery-set" key={`gallery-set-${setIndex}`}>
          {setItems.map((item, itemIndex) => (
           <MediaCard
            key={`${item.key}-${setIndex}-${itemIndex}`}
            item={item}
            itemKey={`${item.key}-${setIndex}-${itemIndex}`}
            onOpen={openItem}
           />
          ))}
         </div>
        ))}
       </div>
       {mediaItems.length > 1 && <button type="button" className="media-gallery-arrow media-gallery-next" onClick={() => nudgeGallery(1)} aria-label="Scroll gallery right">›</button>}
      </div>
     ) : (
      <p className="media-gallery-empty">{content.empty}</p>
     )}
    </div>
   </section>

   {selectedItem && (
    <div className="lightbox open" role="dialog" aria-modal="true" aria-label="Gallery viewer" onClick={(event) => {
     if (event.target === event.currentTarget) closeViewer();
    }}>
     <div className="lightbox-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className={`lightbox-media-frame ${selectedItem.type === 'video' ? 'is-video' : 'is-image'}`}>
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
        <img className="lightbox-media" src={selectedItem.src} alt="DJ Volts event photo" />
       )}

       <button ref={closeButtonRef} type="button" className="lightbox-close" onClick={closeViewer} aria-label="Close gallery viewer">✕</button>
       {mediaItems.length > 1 && (
        <>
         <button type="button" className="lightbox-nav lightbox-prev" onClick={() => changeViewerItem(-1)} aria-label="Previous gallery item">‹</button>
         <button type="button" className="lightbox-nav lightbox-next" onClick={() => changeViewerItem(1)} aria-label="Next gallery item">›</button>
        </>
       )}
      </div>
     </div>
    </div>
   )}
  </>
 );
};
