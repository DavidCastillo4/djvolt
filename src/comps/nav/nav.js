/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect } from 'react';

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

 return (
  <>
   <header className="site">
    <nav>
     <a href="#top" className="brand">
      <img src="assets/logos/logo.png" alt="DJ Volts logo" className="brand-logo" />
     </a>
     <ul className="navlinks">
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
       <a href="#reel">The Reel</a>
      </li>
      <li>
       <a href="#book">Book</a>
      </li>
     </ul>
     <a href="#book" className="nav-cta">Get a Quote</a>
     <button className="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false">☰</button>
    </nav>
    <ul className="navlinks mobile-menu" id="mobileMenu">
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
      <a href="#reel">The Reel</a>
     </li>
     <li>
      <a href="#book">Book</a>
     </li>
    </ul>
   </header>
  </>
 );
};
