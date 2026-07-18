/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DEFAULT_SITE_CONTENT } from '@/lib/siteContent';

export const Navigation = () => {
 const pathname = usePathname();
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 const [content, setContent] = useState(DEFAULT_SITE_CONTENT.nav);

 useEffect(() => { setIsMenuOpen(false); }, [pathname]);
 useEffect(() => {
  let active = true;
  fetch('/api/content', { cache: 'no-store' }).then((r) => r.json()).then((data) => {
   if (active && data.content?.nav) setContent(data.content.nav);
  }).catch(() => {});
  return () => { active = false; };
 }, []);

 const isAdminRoute = pathname.startsWith('/admin');
 const homeHref = (section = '') => (isAdminRoute ? `/${section}` : section);
 const closeMenu = () => setIsMenuOpen(false);
 const links = [['about', content.about], ['services', content.services], ['gallery', content.gallery], ['book', content.book]];

 return <header className="site"><nav><a href={homeHref('#top')} className="brand" aria-label="DJ Volts home"><img src="/assets/logos/logo.png" alt="DJ Volts logo" className="brand-logo" /></a>
  <ul className="navlinks">{links.map(([id,label]) => <li key={id}><a href={homeHref(`#${id}`)}>{label}</a></li>)}</ul>
  <a href={homeHref('#book')} className="nav-cta">{content.cta}</a>
  <button className="menu-btn" type="button" aria-label={isMenuOpen?'Close menu':'Open menu'} aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((v)=>!v)}>{isMenuOpen?'✕':'☰'}</button>
 </nav><ul className={`navlinks mobile-menu${isMenuOpen?' open':''}`}>{links.map(([id,label]) => <li key={id}><a href={homeHref(`#${id}`)} onClick={closeMenu}>{label}</a></li>)}</ul></header>;
};
