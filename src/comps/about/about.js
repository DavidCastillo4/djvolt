/* eslint-disable @next/next/no-img-element */

export const About = () => (
 <section className="about" id="about">
  <div className="wrap">
   <span className="kicker">The Story</span>
   <div className="about-grid">
    <div className="about-photo">
     <img src="/assets/images/about-portrait.jpg" alt="DJ Volts working the booth at a live event" />
     <div className="tag">120V &amp; PROUD OF IT</div>
    </div>
    <div className="about-copy">
     <h2>Two trades. One guy who shows up early and checks his own wiring.</h2>
     <p>By day, he&apos;s out running conduit and troubleshooting panels. By night, he&apos;s behind the decks — same instinct for making sure everything&apos;s connected right, just with a lot more bass.</p>
     <div className="nameplate">
      <div className="nameplate-head">
       <span>Equipment Nameplate</span>
       <span>MODEL: VOLTS-01</span>
      </div>
      <div className="nameplate-grid">
       <div><label>Genres</label><strong>Spanish / Country / Top 40</strong></div>
       <div><label>Setup Time</label><strong>45–60 min</strong></div>
       <div><label>Sound Output</label><strong>2x Pro Line Array</strong></div>
       <div><label>Lighting</label><strong>Uplights + Lasers</strong></div>
       <div><label>Day Job</label><strong>Licensed Electrician</strong></div>
       <div><label>Drink Of Choice</label><strong>Old Fashioned</strong></div>
      </div>
     </div>
    </div>
   </div>
  </div>
 </section>
);
