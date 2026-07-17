/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';

export const Djvolts = ({ galleryImages }) => {
 const [galleryPage, setGalleryPage] = useState(0);
 const [imagesPerPage, setImagesPerPage] = useState(8);

 useEffect(() => {
  const updateImagesPerPage = () => {
   if (window.innerWidth <= 560) setImagesPerPage(4);
   else if (window.innerWidth <= 900) setImagesPerPage(6);
   else setImagesPerPage(8);
  };

  updateImagesPerPage();
  window.addEventListener('resize', updateImagesPerPage);
  return () => window.removeEventListener('resize', updateImagesPerPage);
 }, []);

 const galleryPageCount = Math.max(1, Math.ceil(galleryImages.length / imagesPerPage));
 const visibleGalleryImages = useMemo(() => {
  const startIndex = galleryPage * imagesPerPage;
  return galleryImages.slice(startIndex, startIndex + imagesPerPage);
 }, [galleryImages, galleryPage, imagesPerPage]);

 useEffect(() => {
  if (galleryPage >= galleryPageCount) setGalleryPage(0);
 }, [galleryPage, galleryPageCount]);

 const changeGalleryPage = (direction) => {
  setGalleryPage((currentPage) => (currentPage + direction + galleryPageCount) % galleryPageCount);
 };

 useEffect(() => {
  const cleanup = [];

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear().toString();

  const breakers = Array.from(document.querySelectorAll('.breaker'));
  breakers.forEach((breaker) => {
   const handler = () => {
    breakers.forEach((other) => {
     if (other !== breaker) {
      other.classList.remove('active');
      const otherStatus = other.querySelector('.breaker-status');
      if (otherStatus) otherStatus.textContent = 'OFF';
     }
    });
    const isActive = breaker.classList.toggle('active');
    const status = breaker.querySelector('.breaker-status');
    if (status) status.textContent = isActive ? 'ON' : 'OFF';
   };
   breaker.addEventListener('click', handler);
   cleanup.push(() => breaker.removeEventListener('click', handler));
  });

  const galleryFigures = Array.from(document.querySelectorAll('#galleryGrid figure'));
  const slides = galleryImages.map((src, index) => ({
   src,
   alt: `DJ Volts event photo ${index + 1}`,
  }));

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxFilmstrip = document.getElementById('lightboxFilmstrip');
  const stage = document.querySelector('.lightbox-stage');

  if (slides.length && lightbox && lightboxImg && lightboxCounter && lightboxClose && lightboxPrev && lightboxNext && lightboxFilmstrip && stage) {
   let currentIndex = 0;
   let lastFocused = null;
   let touchStartX = 0;
   let touchStartY = 0;
   let touchActive = false;

   lightboxFilmstrip.innerHTML = '';
   const thumbButtons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lightbox-thumb';
    button.setAttribute('aria-label', `Go to photo ${index + 1}`);
    const image = document.createElement('img');
    image.src = slide.src;
    image.alt = '';
    image.loading = 'lazy';
    button.appendChild(image);
    lightboxFilmstrip.appendChild(button);
    return button;
   });

   const preload = (index) => {
    if (index < 0 || index >= slides.length) return;
    const image = new Image();
    image.src = slides[index].src;
   };

   const render = () => {
    const slide = slides[currentIndex];
    lightboxImg.classList.remove('show');
    requestAnimationFrame(() => {
     lightboxImg.src = slide.src;
     lightboxImg.alt = slide.alt;
     lightboxCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
     requestAnimationFrame(() => lightboxImg.classList.add('show'));
    });
    thumbButtons.forEach((button, index) => {
     button.classList.toggle('active', index === currentIndex);
     if (index === currentIndex) button.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    preload(currentIndex + 1);
    preload(currentIndex - 1);
   };

   const goTo = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    render();
   };
   const nextSlide = () => goTo(currentIndex + 1);
   const prevSlide = () => goTo(currentIndex - 1);
   const openLightbox = (index) => {
    lastFocused = document.activeElement;
    currentIndex = index;
    render();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-locked');
    lightboxClose.focus();
   };
   const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-locked');
    lightboxImg.classList.remove('show');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
   };

   galleryFigures.forEach((figure) => {
    const imageIndex = Number(figure.dataset.galleryIndex);
    const clickHandler = () => openLightbox(imageIndex);
    const keyHandler = (event) => {
     if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(imageIndex);
     }
    };
    figure.addEventListener('click', clickHandler);
    figure.addEventListener('keydown', keyHandler);
    cleanup.push(() => {
     figure.removeEventListener('click', clickHandler);
     figure.removeEventListener('keydown', keyHandler);
    });
   });

   thumbButtons.forEach((button, index) => {
    const handler = () => goTo(index);
    button.addEventListener('click', handler);
    cleanup.push(() => button.removeEventListener('click', handler));
   });

   lightboxClose.addEventListener('click', closeLightbox);
   lightboxNext.addEventListener('click', nextSlide);
   lightboxPrev.addEventListener('click', prevSlide);
   cleanup.push(() => lightboxClose.removeEventListener('click', closeLightbox));
   cleanup.push(() => lightboxNext.removeEventListener('click', nextSlide));
   cleanup.push(() => lightboxPrev.removeEventListener('click', prevSlide));

   const backdropHandler = (event) => { if (event.target === lightbox) closeLightbox(); };
   lightbox.addEventListener('click', backdropHandler);
   cleanup.push(() => lightbox.removeEventListener('click', backdropHandler));

   const keyboardHandler = (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowRight') nextSlide();
    else if (event.key === 'ArrowLeft') prevSlide();
    else if (event.key === 'Tab') {
     const focusable = lightbox.querySelectorAll('button');
     const first = focusable[0];
     const last = focusable[focusable.length - 1];
     if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
     else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
   };
   document.addEventListener('keydown', keyboardHandler);
   cleanup.push(() => document.removeEventListener('keydown', keyboardHandler));

   const touchStartHandler = (event) => {
    if (event.touches.length !== 1) return;
    touchActive = true;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
   };
   const touchEndHandler = (event) => {
    if (!touchActive) return;
    touchActive = false;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
     if (dx < 0) nextSlide(); else prevSlide();
    }
   };
   stage.addEventListener('touchstart', touchStartHandler, { passive: true });
   stage.addEventListener('touchend', touchEndHandler, { passive: true });
   cleanup.push(() => stage.removeEventListener('touchstart', touchStartHandler));
   cleanup.push(() => stage.removeEventListener('touchend', touchEndHandler));
  }

  return () => {
   cleanup.forEach((removeListener) => removeListener());
   document.body.classList.remove('lightbox-locked');
  };
 }, [galleryImages, galleryPage, imagesPerPage]);

 return (
  <>
   <main id="top">
    {/* HERO */}
    <section className="hero" style={{ padding: '0' }}>
     <video autoPlay muted loop playsInline poster="assets/images/booth-red.jpg">
      <source src="assets/heroVideo/hero.mp4" type="video/mp4" />
     </video>
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
       <a href="#reel" className="btn btn-ghost">Watch The Reel</a>
      </div>
      <div className="hero-specs">
       <div>
        <b>250+</b>
        Events Wired
       </div>
       <div>
        <b>Bilingual</b>
        English - Spanish
       </div>
       <div>
        <b>2</b>
        Pro Speaker Rigs
       </div>
       <div>
        <b>Vibe</b>
        Lights & Smoke
       </div>
      </div>
     </div>
    </section>
    <div className="hazard thin"></div>
    {/* TICKER */}
    <div className="ticker" aria-hidden="true">
     <div className="ticker-track">
      <span>COUNTRY</span>
      <span>TOP 40</span>
      <span>CLASSIC ROCK</span>
      <span>LINE DANCE ANTHEMS</span>
      <span>WEDDING FIRST DANCES</span>
      <span>HONKY TONK</span>
      <span>SPANISH</span>
      <span>COUNTRY</span>
      <span>TOP 40</span>
      <span>CLASSIC ROCK</span>
      <span>LINE DANCE ANTHEMS</span>
      <span>WEDDING FIRST DANCES</span>
      <span>HONKY TONK</span>
      <span>SPANISH</span>
     </div>
    </div>
    {/* ABOUT */}
    <section className="about" id="about">
     <div className="wrap about-grid">
      <div className="about-photo">
       <img src="assets/images/about-portrait.jpg" alt="DJ Volts working the booth at a live event" />
       <div className="tag">120V & PROUD OF IT</div>
      </div>
      <div className="about-copy">
       <span className="kicker">The Story</span>
       <h2>Two trades. One guy who shows up early and checks his own wiring.</h2>
       <p>By day, he&apos;s out running conduit and troubleshooting panels. By night, he&apos;s behind the decks — same instinct for making sure everything&apos;s connected right, just with a lot more bass.</p>
       <p>If he isn&apos;t dancing or jaming to his truck radio, DJ Volts is filling your dance floor, taking song request, and continueing the vibe between the vows and the last dance.</p>
       <div className="nameplate">
        <div className="nameplate-head">
         <span>Equipment Nameplate</span>
         <span>MODEL: VOLTS-01</span>
        </div>
        <div className="nameplate-grid">
         <div>
          <label>Genres</label>
          <strong>Spanish / Country / Top 40</strong>
         </div>
         <div>
          <label>Setup Time</label>
          <strong>45–60 min</strong>
         </div>
         <div>
          <label>Sound Output</label>
          <strong>2x Pro Line Array</strong>
         </div>
         <div>
          <label>Lighting</label>
          <strong>Uplights + Lasers</strong>
         </div>
         <div>
          <label>Day Job</label>
          <strong>Licensed Electrician</strong>
         </div>
         <div>
          <label>Drink Of Choice</label>
          <strong>Old Fashioned</strong>
         </div>
        </div>
       </div>
      </div>
     </div>
    </section>
    {/* BREAKER PANEL SERVICES */}
    <section className="panel-section" id="services">
     <div className="wrap">
      <div className="section-head">
       <span className="kicker">Services</span>
       <h2>Flip a breaker to see what&apos;s on the circuit.</h2>
       <p>Every event gets the same rig, the same attention to detail, and a set list built around your crowd — not a generic top 40 loop.</p>
      </div>
      <div className="breaker-box">
       <div className="breaker-box-head">
        <span>Main Panel — Service Menu</span>
        <span className="lamp">
         <i></i>
         Power: On
        </span>
       </div>
       <div className="breakers" id="breakerGroup">
        <button className="breaker active" data-i="1">
         <span className="breaker-status">ON</span>
         <span className="breaker-num">CKT 01</span>
         <div className="switch"></div>
         <h3>Weddings</h3>
         <p>Ceremony sound, cocktail hour playlists, introductions, and a reception that reads the room — not a script.</p>
        </button>
        <button className="breaker" data-i="2">
         <span className="breaker-status">OFF</span>
         <span className="breaker-num">CKT 02</span>
         <div className="switch"></div>
         <h3>Private Parties</h3>
         <p>Anniversaries, graduations and backyard cookouts. Bring the cooler, he&apos;ll bring the playlist.</p>
        </button>
        <button className="breaker" data-i="3">
         <span className="breaker-status">OFF</span>
         <span className="breaker-num">CKT 03</span>
         <div className="switch"></div>
         <h3>Bars & Breweries</h3>
         <p>Line dance nights, live trivia breaks, and sets that keep a bar crowd on their feet until close.</p>
        </button>
        <button className="breaker" data-i="4">
         <span className="breaker-status">OFF</span>
         <span className="breaker-num">CKT 04</span>
         <div className="switch"></div>
         <h3>Corporate & Company Events</h3>
         <p>Company parties and events with clean sound, tasteful lighting, and a set list that fits the crowd.</p>
        </button>
       </div>
      </div>
     </div>
    </section>
    {/* GALLERY */}
    <section className="gallery" id="gallery">
     <div className="wrap">
      <div className="section-head">
       <span className="kicker">Gallery</span>
       <h2>From the booth and the dance floor.</h2>
       <p>A few shots from recent sets — string lights, packed floors, and the rig that makes it all run.</p>
      </div>
      <div className="gallery-grid gallery-page" id="galleryGrid" key={`${galleryPage}-${imagesPerPage}`}>
       {visibleGalleryImages.map((imageSrc, index) => {
        const imageIndex = galleryPage * imagesPerPage + index;

        return (
         <figure
          className={`g${index + 1}`}
          data-gallery-index={imageIndex}
          key={imageSrc}
          tabIndex="0"
          role="button"
          aria-label={`View larger photo ${imageIndex + 1}`}
         >
          <img
           src={imageSrc}
           alt={`DJ Volts event photo ${imageIndex + 1}`}
           loading="lazy"
           decoding="async"
          />
          <span className="gallery-zoom" aria-hidden="true">⤢</span>
         </figure>
        );
       })}
      </div>
      {galleryPageCount > 1 && (
       <div className="gallery-controls" aria-label="Gallery navigation">
        <button type="button" onClick={() => changeGalleryPage(-1)} aria-label="Previous group of photos">‹</button>
        <button type="button" onClick={() => changeGalleryPage(1)} aria-label="Next group of photos">›</button>
       </div>
      )}
     </div>
    </section>
    {/* REEL */}
    <section className="reel" id="reel">
     <div className="wrap reel-grid">
      <div className="reel-video">
       <video controls playsInline poster="assets/images/dance.jpg">
        <source src="assets/video/reel-party.mp4" type="video/mp4" />
       </video>
      </div>
      <div className="reel-copy">
       <span className="kicker">Live Footage</span>
       <h2>See a set in action.</h2>
       <p style={{ color: 'var(--cream-dim)', fontSize: '1.05rem' }}>Straight from the floor — no highlight-reel editing tricks, just what an actual crowd sounds like when the set&apos;s dialed in.</p>
       <ul>
        <li>
         <span className="ic">01</span>
         Full sound check and backup gear on every booking
        </li>
        <li>
         <span className="ic">02</span>
         Wireless mic for toasts, speeches and announcements
        </li>
        <li>
         <span className="ic">03</span>
         Uplighting and dance floor wash included
        </li>
        <li>
         <span className="ic">04</span>
         Song requests taken all night, not just at the start
        </li>
       </ul>
      </div>
     </div>
    </section>
    {/* BOOKING */}
    <section className="book" id="book">
     <div className="wrap book-grid">
      <div>
       <span className="kicker">Booking</span>
       <h2>Let&apos;s get your event wired up.</h2>
       <p style={{ color: 'var(--cream-dim)', fontSize: '1.05rem', maxWidth: '44ch' }}>Reach out with your date, venue and headcount, and you&apos;ll get a straight answer on availability and pricing — no runaround.</p>
       <ul className="contact-list">
        <li>
         <a href="tel:+15125550187">
          <span className="ic">
           <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.7c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"></path>
           </svg>
          </span>
          (512) 555-0187
         </a>
        </li>
        <li>
         <a href="mailto:booking@djvolts.com">
          <span className="ic">
           <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2"></rect>
            <path d="m3.5 6.5 8.5 7 8.5-7"></path>
           </svg>
          </span>
          booking@djvolts.com
         </a>
        </li>
        <li>
         <a href="https://instagram.com/djvolts2025" target="_blank" rel="noopener" aria-label="Visit DJ Volts on Instagram">
          <span className="ic ic-instagram">
           <svg viewBox="0 0 32 32" role="img" aria-hidden="true">
            <defs>
             <radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%">
              <stop offset="0%" stopColor="#ffd600"></stop>
              <stop offset="28%" stopColor="#ff7a00"></stop>
              <stop offset="52%" stopColor="#ff0169"></stop>
              <stop offset="78%" stopColor="#d300c5"></stop>
              <stop offset="100%" stopColor="#7638fa"></stop>
             </radialGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#instagram-gradient)"></rect>
            <rect x="7.2" y="7.2" width="17.6" height="17.6" rx="5.6" fill="none" stroke="#fff" strokeWidth="2.2"></rect>
            <circle cx="16" cy="16" r="4.2" fill="none" stroke="#fff" strokeWidth="2.2"></circle>
            <circle cx="22.2" cy="9.8" r="1.35" fill="#fff"></circle>
           </svg>
          </span>
          @djvolts2025
         </a>
        </li>
       </ul>
      </div>
      <div className="service-ticket">
       <div className="nameplate-head" style={{ margin: '-28px -28px 18px', borderRadius: '8px 8px 0 0' }}>
        <span>Booking Ticket</span>
        <span>SERVICE CALL</span>
       </div>
       <div className="service-ticket-row">
        <span>Response time</span>
        <span>Within 24 hrs</span>
       </div>
       <div className="service-ticket-row">
        <span>Deposit</span>
        <span>Secures your date</span>
       </div>
       <div className="service-ticket-row">
        <span>Travel</span>
        <span>Ask about your area</span>
       </div>
       <div className="service-ticket-row">
        <span>Setup / breakdown</span>
        <span>Included</span>
       </div>
       <div className="service-ticket-row">
        <span>Backup equipment</span>
        <span>Always on site</span>
       </div>
      </div>
     </div>
    </section>
   </main>
   <div className="hazard"></div>
   <footer>
    <div className="wrap footer-grid">
     <div className="footer-brand">
      DJ
      <span>VOLTS</span>
     </div>
     <ul className="footer-links">
      <li>
       <a href="#about">About</a>
      </li>
      <li>
       <a href="#services">Services</a>
      </li>
      <li>
       <a href="#gallery">Gallery</a>
      </li>
      <li>
       <a href="#book">Book</a>
      </li>
     </ul>
    </div>
   </footer>
   {/* GALLERY LIGHTBOX */}
   <div className="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery viewer" aria-hidden="true">
    <button type="button" className="lightbox-close" id="lightboxClose" aria-label="Close gallery viewer">✕</button>
    <button type="button" className="lightbox-nav lightbox-prev" id="lightboxPrev" aria-label="Previous photo">‹</button>
    <button type="button" className="lightbox-nav lightbox-next" id="lightboxNext" aria-label="Next photo">›</button>
    <div className="lightbox-stage">
     <img className="lightbox-img" id="lightboxImg" alt="" />
    </div>
    <div className="lightbox-meta">
     <span className="lightbox-counter" id="lightboxCounter"></span>
    </div>
    <div className="lightbox-filmstrip" id="lightboxFilmstrip"></div>
   </div>
  </>
 );
};
