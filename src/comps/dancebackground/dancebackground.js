'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export const DanceBackground = ({ mediaSettings }) => {
 const containerRef = useRef(null);
 const videoRef = useRef(null);
 const [isReady, setIsReady] = useState(false);
 const [allowMotionVideo, setAllowMotionVideo] = useState(true);
 const enableBackgroundVideo = mediaSettings?.enableBackgroundVideo ?? true;
 const enableBackgroundPoster = mediaSettings?.enableBackgroundPoster ?? true;
 const shouldRenderVideo = enableBackgroundVideo && allowMotionVideo;

 useEffect(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  const updateCapability = () => {
   setAllowMotionVideo(!reducedMotion.matches && !connection?.saveData);
  };

  updateCapability();
  reducedMotion.addEventListener?.('change', updateCapability);
  connection?.addEventListener?.('change', updateCapability);

  return () => {
   reducedMotion.removeEventListener?.('change', updateCapability);
   connection?.removeEventListener?.('change', updateCapability);
  };
 }, []);

 useEffect(() => {
  const container = containerRef.current;
  const video = videoRef.current;
  if (!container || !video || !shouldRenderVideo) return undefined;

  let isVisible = false;

  const updatePlayback = () => {
   if (!document.hidden && isVisible) {
    video.play().catch(() => {});
   } else {
    video.pause();
   }
  };

  const observer = new IntersectionObserver(([entry]) => {
   isVisible = entry.isIntersecting;
   updatePlayback();
  }, { rootMargin: '180px 0px', threshold: 0.01 });

  observer.observe(container);
  document.addEventListener('visibilitychange', updatePlayback);

  return () => {
   observer.disconnect();
   document.removeEventListener('visibilitychange', updatePlayback);
   video.pause();
  };
 }, [shouldRenderVideo]);

 return (
  <div ref={containerRef} className={`dance-background${isReady ? ' is-ready' : ''}`} aria-hidden="true">
   {!shouldRenderVideo && enableBackgroundPoster && <Image className="dance-background-poster" src="/api/posters/background" alt="" fill sizes="100vw" unoptimized />}
   {shouldRenderVideo && (
    <video
     ref={videoRef}
     src="/api/videos/background"
     {...(enableBackgroundPoster ? { poster: '/api/posters/background' } : {})}
     autoPlay
     muted
     loop
     playsInline
     preload="metadata"
     onCanPlay={() => setIsReady(true)}
    />
   )}
   <div className="dance-background-wash"></div>
   <div className="dance-background-glow dance-background-glow-one"></div>
   <div className="dance-background-glow dance-background-glow-two"></div>
  </div>
 );
};
