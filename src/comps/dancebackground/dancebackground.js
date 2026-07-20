'use client';

import { useEffect, useRef, useState } from 'react';

export const DanceBackground = ({ mediaSettings }) => {
 const videoRef = useRef(null);
 const [isReady, setIsReady] = useState(false);
 const enableBackgroundVideo = mediaSettings?.enableBackgroundVideo ?? true;
 const enableBackgroundPoster = mediaSettings?.enableBackgroundPoster ?? true;

 useEffect(() => {
  if (!enableBackgroundVideo) return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const video = videoRef.current;

  if (mediaQuery.matches) video?.pause();
 }, [enableBackgroundVideo]);

 return (
  <div className={`dance-background${isReady ? ' is-ready' : ''}`} aria-hidden="true">
   {!enableBackgroundVideo && enableBackgroundPoster && <img className="dance-background-poster" src="/api/posters/background" alt="" />}
   {enableBackgroundVideo && (
    <video
     ref={videoRef}
     src="/api/videos/background"
     {...(enableBackgroundPoster ? { poster: '/api/posters/background' } : {})}
     autoPlay
     muted
     loop
     playsInline
     preload="auto"
     onCanPlay={() => setIsReady(true)}
    />
   )}
   <div className="dance-background-wash"></div>
   <div className="dance-background-glow dance-background-glow-one"></div>
   <div className="dance-background-glow dance-background-glow-two"></div>
  </div>
 );
};
