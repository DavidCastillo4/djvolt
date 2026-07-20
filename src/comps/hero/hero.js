'use client';

import Image from 'next/image';
import { useState } from 'react';

export const Hero = ({ content, mediaSettings }) => {
 const [videoReady, setVideoReady] = useState(false);
 const enableHeroVideo = mediaSettings?.enableHeroVideo ?? true;
 const enableHeroPoster = mediaSettings?.enableHeroPoster ?? true;

 return <><section className={`hero${videoReady ? ' hero-video-ready' : ''}`} style={{ padding: 0 }} id="top">
  {!enableHeroVideo && enableHeroPoster && <Image className="hero-fallback" src="/api/posters/hero" alt="" aria-hidden="true" fill sizes="100vw" unoptimized />}
  {enableHeroVideo && (
   <video
    src="/api/videos/hero"
    {...(enableHeroPoster ? { poster: '/api/posters/hero' } : {})}
    autoPlay
    muted
    loop
    playsInline
    preload="auto"
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
