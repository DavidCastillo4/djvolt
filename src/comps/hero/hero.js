export const Hero = () => (
 <>
  <section className="hero" style={{ padding: '0' }} id="top">
   <video src="/api/videos/hero" autoPlay muted loop playsInline poster="/api/images/by-name/booth-red.jpg" />
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
