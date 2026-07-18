'use client';

import { useState } from 'react';

export const Hero = () => {
 const [videoReady, setVideoReady] = useState(false);

 return (
  <>
   <section className={`hero${videoReady ? ' hero-video-ready' : ''}`} style={{ padding: '0' }} id="top">
    <video
     src="/api/videos/hero"
     poster="/api/posters/hero"
     autoPlay
     muted
     loop
     playsInline
     preload="auto"
     onCanPlay={() => setVideoReady(true)}
    />
    <div className="hero-inner">
     <span className="eyebrow">
      <span className="dot"></span>
      Now booking weddings & events
     </span>
     <h1 className="wordmark">
      DJ
      <br />
      <span>VOLTS</span>
     </h1>
     <p className="tagline">Licensed electrician by day. Fully wired for a good time by night. Spanish, Country, top 40 and dance-floor classics, run by a guy who actually reads the dance floor.</p>
     <div className="hero-ctas">
      <a href="#book" className="btn btn-volt">⚡ Book The Power</a>
      <a href="#gallery" className="btn btn-ghost">View The Gallery</a>
     </div>
     <div className="hero-specs">
      <div><b>250+</b>Events Wired</div>
      <div><b>Bilingual</b>English - Spanish</div>
      <div><b>2</b>Pro Speaker Rigs</div>
      <div><b>Vibe</b>Lights & Smoke</div>
     </div>
    </div>
   </section>
   <div className="hazard thin"></div>
  </>
 );
};
