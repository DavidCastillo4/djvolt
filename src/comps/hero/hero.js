'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export const Hero = ({ content, mediaSettings }) => {
 const sectionRef = useRef(null);
 const videoRef = useRef(null);
 const [videoReady, setVideoReady] = useState(false);
 const [allowMotionVideo, setAllowMotionVideo] = useState(true);
 const enableHeroVideo = mediaSettings?.enableHeroVideo ?? true;
 const enableHeroPoster = mediaSettings?.enableHeroPoster ?? true;
 const shouldRenderVideo = enableHeroVideo && allowMotionVideo;

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
  const section = sectionRef.current;
  const video = videoRef.current;
  if (!section || !video || !shouldRenderVideo) return undefined;

  let isVisible = true;

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
  }, { threshold: 0.08 });

  observer.observe(section);
  document.addEventListener('visibilitychange', updatePlayback);
  updatePlayback();

  return () => {
   observer.disconnect();
   document.removeEventListener('visibilitychange', updatePlayback);
   video.pause();
  };
 }, [shouldRenderVideo]);

 return <><section ref={sectionRef} className={`hero${videoReady ? ' hero-video-ready' : ''}`} style={{ padding: 0 }} id="top">
  {!shouldRenderVideo && enableHeroPoster && <Image className="hero-fallback" src="/api/posters/hero" alt="" aria-hidden="true" fill sizes="100vw" unoptimized priority />}
  {shouldRenderVideo && (
   <video
    ref={videoRef}
    src="/api/videos/hero"
    {...(enableHeroPoster ? { poster: '/api/posters/hero' } : {})}
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    onCanPlay={() => setVideoReady(true)}
   />
  )}
  <div className="hero-inner"><span className="eyebrow"><span className="dot"></span>{content.eyebrow}</span>
   <h1 className="wordmark">{content.titleTop}<br /><span>{content.titleBottom}</span></h1>
   <p className="tagline">{content.tagline}</p>
   <div className="hero-ctas"><a href="#book" className="btn btn-volt">{content.primaryButton}</a><a href="#gallery" className="btn btn-ghost">{content.secondaryButton}</a></div>
   <div className="hero-specs"><div><b>{content.stat1Value}</b>{content.stat1Label}</div><div><b>{content.stat2Value}</b>{content.stat2Label}</div><div><b>{content.stat3Value}</b>{content.stat3Label}</div><div><b>{content.stat4Value}</b>{content.stat4Label}</div></div>
  </div></section><div className="hazard thin"></div></>;
};
