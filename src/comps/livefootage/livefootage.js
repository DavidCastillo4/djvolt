'use client';

import { useEffect, useRef, useState } from 'react';

export const LiveFootage = ({ videos }) => {
 const [currentIndex, setCurrentIndex] = useState(0);
 const videoRef = useRef(null);
 const videoCount = videos.length;
 const currentVideo = videos[currentIndex] || null;

 useEffect(() => {
  if (currentIndex >= videoCount) setCurrentIndex(0);
 }, [currentIndex, videoCount]);

 useEffect(() => {
  if (!videoRef.current) return;
  videoRef.current.load();
 }, [currentVideo?.src]);

 const changeVideo = (direction) => {
  if (videoCount <= 1) return;
  setCurrentIndex((index) => (index + direction + videoCount) % videoCount);
 };

 return (
  <section className="reel" id="reel">
   <div className="wrap reel-grid">
    <div className="reel-video">
     {currentVideo ? (
      <video
       ref={videoRef}
       src={currentVideo.src}
       controls
       playsInline
       poster="/assets/images/dance.jpg"
      />
     ) : (
      <div className="reel-video-empty">Live footage is coming soon.</div>
     )}

     {videoCount > 1 && (
      <div className="reel-controls" aria-label="Live footage navigation">
       <button type="button" onClick={() => changeVideo(-1)} aria-label="Previous live footage video">‹</button>
       <span>{currentIndex + 1} / {videoCount}</span>
       <button type="button" onClick={() => changeVideo(1)} aria-label="Next live footage video">›</button>
      </div>
     )}
    </div>
    <div className="reel-copy">
     <span className="kicker">Live Footage</span>
     <h2>See a set in action.</h2>
     <p style={{ color: 'var(--cream-dim)', fontSize: '1.05rem' }}>Straight from the floor — no highlight-reel editing tricks, just what an actual crowd sounds like when the set&apos;s dialed in.</p>
     <ul>
      <li><span className="ic">01</span>Full sound check and backup gear on every booking</li>
      <li><span className="ic">02</span>Wireless mic for toasts, speeches and announcements</li>
      <li><span className="ic">03</span>Uplighting and dance floor wash included</li>
      <li><span className="ic">04</span>Song requests taken all night, not just at the start</li>
     </ul>
    </div>
   </div>
  </section>
 );
};
