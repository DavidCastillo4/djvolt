/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const Navigation = () => {
 const pathname = usePathname();
 const [isMenuOpen, setIsMenuOpen] = useState(false);

 useEffect(() => {
  setIsMenuOpen(false);
 }, [pathname]);

 const isAdminRoute = pathname.startsWith('/admin');
 const homeHref = (section = '') => (isAdminRoute ? `/${section}` : section);
 const closeMenu = () => setIsMenuOpen(false);

 return (
  <header className="site">
   <nav>
    <a href={homeHref('#top')} className="brand" aria-label="DJ Volts home">
     <img src="/assets/logos/logo.png" alt="DJ Volts logo" className="brand-logo" />
    </a>

    <ul className="navlinks">
     <li><a href={homeHref('#about')}>About</a></li>
     <li><a href={homeHref('#services')}>Services</a></li>
     <li><a href={homeHref('#gallery')}>Gallery</a></li>
     <li><a href={homeHref('#book')}>Book</a></li>
    </ul>

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
