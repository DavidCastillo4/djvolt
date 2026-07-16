'use client';

import { useEffect } from 'react';

const pageMarkup = '<main id="top">\n\n  <!-- HERO -->\n  <section class="hero" style="padding:0;">\n    <video autoplay muted loop playsinline poster="assets/images/booth-red.jpg">\n      <source src="assets/video/hero-loop.mp4" type="video/mp4">\n    </video>\n    <div class="hero-inner">\n      <span class="eyebrow"><span class="dot"></span> Now booking weddings &amp; events</span>\n      <h1 class="wordmark">DJ<br><span>VOLTS</span></h1>\n      <p class="tagline">Licensed electrician by day. Fully wired for a good time by night. Spanish, Country, top 40 and dance-floor classics, run by a guy who actually reads the dance floor.</p>\n      <div class="hero-ctas">\n        <a href="#book" class="btn btn-volt">⚡ Book The Power</a>\n        <a href="#reel" class="btn btn-ghost">Watch The Reel</a>\n      </div>\n      <div class="hero-specs">\n        <div><b>250+</b>Events Wired</div>\n        <div><b>Bilingual</b>English - Spanish</div>\n        <div><b>2</b>Pro Speaker Rigs</div>\n        <div><b>Vibe</b>Lights & Smoke</div>\n      </div>\n    </div>\n  </section>\n\n  <div class="hazard thin"></div>\n\n  <!-- TICKER -->\n  <div class="ticker" aria-hidden="true">\n    <div class="ticker-track">\n      <span>COUNTRY</span><span>TOP 40</span><span>CLASSIC ROCK</span><span>LINE DANCE ANTHEMS</span><span>WEDDING FIRST DANCES</span><span>HONKY TONK</span><span>SPANISH</span>\n      <span>COUNTRY</span><span>TOP 40</span><span>CLASSIC ROCK</span><span>LINE DANCE ANTHEMS</span><span>WEDDING FIRST DANCES</span><span>HONKY TONK</span><span>SPANISH</span>\n    </div>\n  </div>\n\n  <!-- ABOUT -->\n  <section class="about" id="about">\n    <div class="wrap about-grid">\n      <div class="about-photo">\n        <img src="assets/images/about-portrait.jpg" alt="DJ Volts working the booth at a live event">\n        <div class="tag">120V &amp; PROUD OF IT</div>\n      </div>\n      <div class="about-copy">\n        <span class="kicker">The Story</span>\n        <h2>Two trades. One guy who shows up early and checks his own wiring.</h2>\n        <p>By day, he\'s out running conduit and troubleshooting panels. By night, he\'s behind the decks — same instinct for making sure everything\'s connected right, just with a lot more bass.</p>\n        <p>If he isn\'t dancing or jaming to his truck radio, DJ Volts is filling your dance floor, taking song request, and continueing the vibe between the vows and the last dance.</p>\n        <div class="nameplate">\n          <div class="nameplate-head"><span>Equipment Nameplate</span><span>MODEL: VOLTS-01</span></div>\n          <div class="nameplate-grid">\n            <div><label>Genres</label><strong>Spanish / Country / Top 40</strong></div>\n            <div><label>Setup Time</label><strong>45–60 min</strong></div>\n            <div><label>Sound Output</label><strong>2x Pro Line Array</strong></div>\n            <div><label>Lighting</label><strong>Uplights + Lasers</strong></div>\n            <div><label>Day Job</label><strong>Licensed Electrician</strong></div>\n            <div><label>Drink Of Choice</label><strong>Old Fashioned</strong></div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <!-- BREAKER PANEL SERVICES -->\n  <section class="panel-section" id="services">\n    <div class="wrap">\n      <div class="section-head">\n        <span class="kicker">Services</span>\n        <h2>Flip a breaker to see what\'s on the circuit.</h2>\n        <p>Every event gets the same rig, the same attention to detail, and a set list built around your crowd — not a generic top 40 loop.</p>\n      </div>\n\n      <div class="breaker-box">\n        <div class="breaker-box-head">\n          <span>Main Panel — Service Menu</span>\n          <span class="lamp"><i></i> Power: On</span>\n        </div>\n        <div class="breakers" id="breakerGroup">\n          <button class="breaker active" data-i="1">\n            <span class="breaker-status">ON</span>\n            <span class="breaker-num">CKT 01</span>\n            <div class="switch"></div>\n            <h3>Weddings</h3>\n            <p>Ceremony sound, cocktail hour playlists, introductions, and a reception that reads the room — not a script.</p>\n          </button>\n          <button class="breaker" data-i="2">\n            <span class="breaker-status">OFF</span>\n            <span class="breaker-num">CKT 02</span>\n            <div class="switch"></div>\n            <h3>Private Parties</h3>\n            <p>Anniversaries, graduations and backyard cookouts. Bring the cooler, he\'ll bring the playlist.</p>\n          </button>\n          <button class="breaker" data-i="3">\n            <span class="breaker-status">OFF</span>\n            <span class="breaker-num">CKT 03</span>\n            <div class="switch"></div>\n            <h3>Bars &amp; Breweries</h3>\n            <p>Line dance nights, live trivia breaks, and sets that keep a bar crowd on their feet until close.</p>\n          </button>\n          <button class="breaker" data-i="4">\n            <span class="breaker-status">OFF</span>\n            <span class="breaker-num">CKT 04</span>\n            <div class="switch"></div>\n            <h3>Corporate &amp; Company Events</h3>\n            <p>Company parties and events with clean sound, tasteful lighting, and a set list that fits the crowd.</p>\n          </button>\n        </div>\n      </div>\n    </div>\n  </section>\n\n  <!-- GALLERY -->\n  <section class="gallery" id="gallery">\n    <div class="wrap">\n      <div class="section-head">\n        <span class="kicker">Gallery</span>\n        <h2>From the booth and the dance floor.</h2>\n        <p>A few shots from recent sets — string lights, packed floors, and the rig that makes it all run.</p>\n      </div>\n      <div class="gallery-grid" id="galleryGrid">\n        <figure class="g1" tabindex="0" role="button" aria-label="View larger photo: Golden hour setup"><img src="assets/images/string-lights.jpg" alt="Outdoor venue strung with string lights at dusk" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Golden hour setup</figcaption></figure>\n        <figure class="g2" tabindex="0" role="button" aria-label="View larger photo: Booth lighting"><img src="assets/images/booth-purple.jpg" alt="DJ booth lit up in purple and blue uplighting" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Booth lighting</figcaption></figure>\n        <figure class="g3" tabindex="0" role="button" aria-label="View larger photo: The rig"><img src="assets/images/gear-controller.jpg" alt="Close up of DJ controller and mixer" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>The rig</figcaption></figure>\n        <figure class="g4" tabindex="0" role="button" aria-label="View larger photo: Dance floor, packed"><img src="assets/images/dance-floor.jpg" alt="Packed dance floor under colored lights" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Dance floor, packed</figcaption></figure>\n        <figure class="g5" tabindex="0" role="button" aria-label="View larger photo: Tent party"><img src="assets/images/tent-party.jpg" alt="Outdoor tent party with string lights and guests" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Tent party</figcaption></figure>\n        <figure class="g6" tabindex="0" role="button" aria-label="View larger photo: Pro sound rig"><img src="assets/images/speakers-stand.jpg" alt="Professional speakers set up on stands" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Pro sound rig</figcaption></figure>\n        <figure class="g7" tabindex="0" role="button" aria-label="View larger photo: Crowd on the floor"><img src="assets/images/crowd-lights.jpg" alt="Crowd dancing under colorful event lighting" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Crowd on the floor</figcaption></figure>\n        <figure class="g8" tabindex="0" role="button" aria-label="View larger photo: Evening setup"><img src="assets/images/outdoor-setup.jpg" alt="Outdoor DJ setup at an evening event" loading="lazy" decoding="async"><span class="gallery-zoom" aria-hidden="true">⤢</span><figcaption>Evening setup</figcaption></figure>\n      </div>\n    </div>\n\n  </section>\n\n  <!-- REEL -->\n  <section class="reel" id="reel">\n    <div class="wrap reel-grid">\n      <div class="reel-video">\n        <video controls playsinline poster="assets/images/dance.jpg">\n          <source src="assets/video/reel-party.mp4" type="video/mp4">\n        </video>\n      </div>\n      <div class="reel-copy">\n        <span class="kicker">Live Footage</span>\n        <h2>See a set in action.</h2>\n        <p style="color:var(--cream-dim); font-size:1.05rem;">Straight from the floor — no highlight-reel editing tricks, just what an actual crowd sounds like when the set\'s dialed in.</p>\n        <ul>\n          <li><span class="ic">01</span> Full sound check and backup gear on every booking</li>\n          <li><span class="ic">02</span> Wireless mic for toasts, speeches and announcements</li>\n          <li><span class="ic">03</span> Uplighting and dance floor wash included</li>\n          <li><span class="ic">04</span> Song requests taken all night, not just at the start</li>\n        </ul>\n      </div>\n    </div>\n  </section>\n\n  <!-- BOOKING -->\n  <section class="book" id="book">\n    <div class="wrap book-grid">\n      <div>\n        <span class="kicker">Booking</span>\n        <h2>Let\'s get your event wired up.</h2>\n        <p style="color:var(--cream-dim); font-size:1.05rem; max-width:44ch;">Reach out with your date, venue and headcount, and you\'ll get a straight answer on availability and pricing — no runaround.</p>\n\n        <ul class="contact-list">\n          <li><a href="tel:+15125550187"><span class="ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.7c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"/></svg></span> (512) 555-0187</a></li>\n          <li><a href="mailto:booking@djvolts.com"><span class="ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 7 8.5-7"/></svg></span> booking@djvolts.com</a></li>\n          <li><a href="https://instagram.com/djvolts2025" target="_blank" rel="noopener" aria-label="Visit DJ Volts on Instagram"><span class="ic ic-instagram"><svg viewBox="0 0 32 32" role="img" aria-hidden="true"><defs><radialGradient id="instagram-gradient" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#ffd600"/><stop offset="28%" stop-color="#ff7a00"/><stop offset="52%" stop-color="#ff0169"/><stop offset="78%" stop-color="#d300c5"/><stop offset="100%" stop-color="#7638fa"/></radialGradient></defs><rect width="32" height="32" rx="8" fill="url(#instagram-gradient)"/><rect x="7.2" y="7.2" width="17.6" height="17.6" rx="5.6" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="16" cy="16" r="4.2" fill="none" stroke="#fff" stroke-width="2.2"/><circle cx="22.2" cy="9.8" r="1.35" fill="#fff"/></svg></span> @djvolts2025</a></li>\n        </ul>\n       \n      </div>\n\n      <div class="service-ticket">\n        <div class="nameplate-head" style="margin:-28px -28px 18px; border-radius:8px 8px 0 0;"><span>Booking Ticket</span><span>SERVICE CALL</span></div>\n        <div class="service-ticket-row"><span>Response time</span><span>Within 24 hrs</span></div>\n        <div class="service-ticket-row"><span>Deposit</span><span>Secures your date</span></div>\n        <div class="service-ticket-row"><span>Travel</span><span>Ask about your area</span></div>\n        <div class="service-ticket-row"><span>Setup / breakdown</span><span>Included</span></div>\n        <div class="service-ticket-row"><span>Backup equipment</span><span>Always on site</span></div>\n      </div>\n    </div>\n  </section>\n\n</main>\n\n<div class="hazard"></div>\n\n<footer>\n  <div class="wrap footer-grid">\n    <div class="footer-brand">DJ <span>VOLTS</span></div>\n    <ul class="footer-links">\n      <li><a href="#about">About</a></li>\n      <li><a href="#services">Services</a></li>\n      <li><a href="#gallery">Gallery</a></li>\n      <li><a href="#book">Book</a></li>\n    </ul>\n  </div>    \n</footer>\n\n<!-- GALLERY LIGHTBOX -->\n<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery viewer" aria-hidden="true">\n  <button type="button" class="lightbox-close" id="lightboxClose" aria-label="Close gallery viewer">✕</button>\n  <button type="button" class="lightbox-nav lightbox-prev" id="lightboxPrev" aria-label="Previous photo">‹</button>\n  <button type="button" class="lightbox-nav lightbox-next" id="lightboxNext" aria-label="Next photo">›</button>\n  <div class="lightbox-stage">\n    <img class="lightbox-img" id="lightboxImg" src="" alt="">\n  </div>\n  <div class="lightbox-meta">\n    <span class="lightbox-caption" id="lightboxCaption"></span>\n    <span class="lightbox-counter" id="lightboxCounter"></span>\n  </div>\n  <div class="lightbox-filmstrip" id="lightboxFilmstrip"></div>\n</div>';

export const Djvolts = () => {
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
  const slides = galleryFigures.map((figure) => {
   const image = figure.querySelector('img');
   return {
    src: image?.getAttribute('src') || '',
    alt: image?.getAttribute('alt') || '',
    caption: figure.querySelector('figcaption')?.textContent || '',
   };
  });

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxFilmstrip = document.getElementById('lightboxFilmstrip');
  const stage = document.querySelector('.lightbox-stage');

  if (slides.length && lightbox && lightboxImg && lightboxCaption && lightboxCounter && lightboxClose && lightboxPrev && lightboxNext && lightboxFilmstrip && stage) {
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
    button.setAttribute('aria-label', `Go to photo ${index + 1}: ${slide.caption}`);
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
     lightboxCaption.textContent = slide.caption;
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

   galleryFigures.forEach((figure, index) => {
    const clickHandler = () => openLightbox(index);
    const keyHandler = (event) => {
     if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(index);
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
 }, []);

 return <div dangerouslySetInnerHTML={{ __html: pageMarkup }} />;
};
