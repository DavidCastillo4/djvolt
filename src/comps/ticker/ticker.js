'use client';

import { useEffect, useMemo, useRef } from 'react';

export const Ticker = ({ content }) => {
 const trackRef = useRef(null);

 const genres = useMemo(() => String(content?.items || '')
  .split('|')
  .map((item) => item.trim())
  .filter(Boolean), [content?.items]);

 const requestedSpeed = Number(content?.speed);
 const durationSeconds = Number.isFinite(requestedSpeed)
  ? Math.min(60, Math.max(12, requestedSpeed))
  : 32;

 useEffect(() => {
  const track = trackRef.current;
  if (!track || genres.length === 0) return undefined;

  let animationFrame = 0;
  let cycleWidth = 0;
  let startTime = performance.now();

  const measure = () => {
   // The list is rendered twice. Half of the full track is one seamless cycle.
   cycleWidth = track.scrollWidth / 2;
   startTime = performance.now();
   track.style.transform = 'translate3d(0, 0, 0)';
  };

  const animate = (now) => {
   if (cycleWidth > 0) {
    const elapsedSeconds = (now - startTime) / 1000;
    const progress = (elapsedSeconds % durationSeconds) / durationSeconds;
    track.style.transform = `translate3d(${-cycleWidth * progress}px, 0, 0)`;
   }
   animationFrame = requestAnimationFrame(animate);
  };

  measure();

  const resizeObserver = typeof ResizeObserver !== 'undefined'
   ? new ResizeObserver(measure)
   : null;
  resizeObserver?.observe(track);

  animationFrame = requestAnimationFrame(animate);

  return () => {
   cancelAnimationFrame(animationFrame);
   resizeObserver?.disconnect();
   track.style.transform = '';
  };
 }, [durationSeconds, genres]);

 if (genres.length === 0) return null;

 return (
  <div className="ticker" aria-hidden="true">
   <div
    ref={trackRef}
    className="ticker-track"
    data-duration-seconds={durationSeconds}
   >
    {[...genres, ...genres].map((genre, index) => (
     <span key={`${genre}-${index}`}>{genre}</span>
    ))}
   </div>
  </div>
 );
};
