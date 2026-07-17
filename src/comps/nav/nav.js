/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const THEMES = [
 { value: 'original', label: 'Original Workshop' },
 { value: 'electric-sunset', label: 'Electric Sunset' },
 { value: 'redline', label: 'Redline' },
 { value: 'gold-rush', label: 'Gold Rush' },
 { value: 'neon-night', label: 'Neon Night' },
 { value: 'purple-pulse', label: 'Purple Pulse' },
 { value: 'ice-voltage', label: 'Ice Voltage' },
];

export const Navigation = () => {
 const pathname = usePathname();
 const [theme, setTheme] = useState('original');


 useEffect(() => {
  const savedTheme = window.localStorage.getItem('dj-volts-theme') || 'original';
  setTheme(savedTheme);
  document.documentElement.dataset.theme = savedTheme;
 }, []);

 const handleThemeChange = (event) => {
  const nextTheme = event.target.value;
  setTheme(nextTheme);
  document.documentElement.dataset.theme = nextTheme;
  window.localStorage.setItem('dj-volts-theme', nextTheme);
 };

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

 if (pathname.startsWith('/admin')) return null;

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
     <label className="theme-picker">
      <span className="sr-only">Choose a color theme</span>
      <select value={theme} onChange={handleThemeChange} aria-label="Choose a color theme">
       {THEMES.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
       ))}
      </select>
     </label>
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
