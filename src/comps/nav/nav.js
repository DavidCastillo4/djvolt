/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const THEMES = [
 { value: 'original', label: 'Original Workshop', logo: '/assets/logos/logo.png' },
 { value: 'electric-sunset', label: 'Electric Sunset', logo: '/assets/logos/electricsunset.png' },
 { value: 'redline', label: 'Redline', logo: '/assets/logos/redline.png' },
 { value: 'gold-rush', label: 'Gold Rush', logo: '/assets/logos/goldrush.png' },
 { value: 'neon-night', label: 'Neon Night', logo: '/assets/logos/neonnight.png' },
 { value: 'purple-pulse', label: 'Purple Pulse', logo: '/assets/logos/purplepulse.png' },
 { value: 'ice-voltage', label: 'Ice Voltage', logo: '/assets/logos/icevoltage.png' },
];

const DEFAULT_THEME = THEMES[0];

export const Navigation = () => {
 const pathname = usePathname();
 const [theme, setTheme] = useState(DEFAULT_THEME.value);
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 useEffect(() => {
  const savedTheme = window.localStorage.getItem('dj-volts-theme');
  const validTheme = THEMES.some((option) => option.value === savedTheme)
   ? savedTheme
   : DEFAULT_THEME.value;

  setTheme(validTheme);
  document.documentElement.dataset.theme = validTheme;
 }, []);

 useEffect(() => {
  setIsMenuOpen(false);
 }, [pathname]);

 const handleThemeChange = (event) => {
  const nextTheme = event.target.value;
  setTheme(nextTheme);
  document.documentElement.dataset.theme = nextTheme;
  window.localStorage.setItem('dj-volts-theme', nextTheme);
 };

 const activeTheme = THEMES.find((option) => option.value === theme) || DEFAULT_THEME;
 const isAdminRoute = pathname.startsWith('/admin');
 const homeHref = (section = '') => (isAdminRoute ? `/${section}` : section);
 const closeMenu = () => setIsMenuOpen(false);

 return (
  <header className="site">
   <nav>
    <a href={homeHref('#top')} className="brand" aria-label="DJ Volts home">
     <img src={activeTheme.logo} alt={`${activeTheme.label} DJ Volts logo`} className="brand-logo" />
    </a>

    <ul className="navlinks">
     <li><a href={homeHref('#about')}>About</a></li>
     <li><a href={homeHref('#services')}>Services</a></li>
     <li><a href={homeHref('#gallery')}>Gallery</a></li>
     <li><a href={homeHref('#book')}>Book</a></li>
    </ul>

    <label className="theme-picker">
     <span className="sr-only">Choose a color theme</span>
     <select value={theme} onChange={handleThemeChange} aria-label="Choose a color theme">
      {THEMES.map((option) => (
       <option key={option.value} value={option.value}>{option.label}</option>
      ))}
     </select>
    </label>

    <a href={homeHref('#book')} className="nav-cta">Get a Quote</a>

    <button
     className="menu-btn"
     type="button"
     aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
     aria-expanded={isMenuOpen}
     onClick={() => setIsMenuOpen((current) => !current)}
    >
     {isMenuOpen ? '✕' : '☰'}
    </button>
   </nav>

   <ul className={`navlinks mobile-menu${isMenuOpen ? ' open' : ''}`}>
    <li><a href={homeHref('#about')} onClick={closeMenu}>About</a></li>
    <li><a href={homeHref('#services')} onClick={closeMenu}>Services</a></li>
    <li><a href={homeHref('#gallery')} onClick={closeMenu}>Gallery</a></li>
    <li><a href={homeHref('#book')} onClick={closeMenu}>Book</a></li>
   </ul>
  </header>
 );
};
