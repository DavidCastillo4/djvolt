'use client';

import { useEffect, useRef, useState } from 'react';

export const DanceBackground = () => {
 const videoRef = useRef(null);
 const [isReady, setIsReady] = useState(false);

 useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const video = videoRef.current;

  if (mediaQuery.matches) {
   video?.pause();
  }
 }, []);

 return (
  <div className={`dance-background${isReady ? ' is-ready' : ''}`} aria-hidden="true">
   <video
    ref={videoRef}
    src="/api/videos/background"
    poster="/api/posters/background"
    autoPlay
    muted
    loop
    playsInline
    preload="auto"
    onCanPlay={() => setIsReady(true)}
   />
   <div className="dance-background-wash"></div>
   <div className="dance-background-glow dance-background-glow-one"></div>
   <div className="dance-background-glow dance-background-glow-two"></div>
  </div>
 );
};
