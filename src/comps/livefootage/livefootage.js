export const LiveFootage = () => (
 <section className="reel" id="reel">
  <div className="wrap reel-grid">
   <div className="reel-video">
    <video src="/api/videos/live-footage" controls playsInline poster="/assets/images/dance.jpg" />
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
