'use client';

import { useEffect } from 'react';

const navigationMarkup = '<div class="hazard"></div>\n\n<header class="site">\n  <nav>\n    <a href="#top" class="brand"><img src="assets/logos/logo.png" alt="DJ Volts logo" class="brand-logo"></a>\n    <ul class="navlinks">\n      <li><a href="#about">About</a></li>\n      <li><a href="#services">Services</a></li>\n      <li><a href="#gallery">Gallery</a></li>\n      <li><a href="#reel">The Reel</a></li>\n      <li><a href="#book">Book</a></li>\n    </ul>\n    <a href="#book" class="nav-cta">Get a Quote</a>\n    <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">☰</button>\n  </nav>\n  <ul class="navlinks mobile-menu" id="mobileMenu">\n    <li><a href="#about">About</a></li>\n    <li><a href="#services">Services</a></li>\n    <li><a href="#gallery">Gallery</a></li>\n    <li><a href="#reel">The Reel</a></li>\n    <li><a href="#book">Book</a></li>\n  </ul>\n</header>';

export const Navigation = () => {
 useEffect(() => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!menuBtn || !mobileMenu) return undefined;

  const toggleMenu = () => {
   const isOpen = mobileMenu.classList.toggle('open');
   menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
   menuBtn.textContent = isOpen ? '✕' : '☰';
  };

  const closeMenu = () => {
   mobileMenu.classList.remove('open');
   menuBtn.setAttribute('aria-expanded', 'false');
   menuBtn.textContent = '☰';
  };

  menuBtn.addEventListener('click', toggleMenu);
  const links = Array.from(mobileMenu.querySelectorAll('a'));
  links.forEach((link) => link.addEventListener('click', closeMenu));

  return () => {
   menuBtn.removeEventListener('click', toggleMenu);
   links.forEach((link) => link.removeEventListener('click', closeMenu));
  };
 }, []);

 return <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: navigationMarkup }} />;
};
