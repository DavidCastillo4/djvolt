import { Navigation } from '@/comps/nav/nav';
import './globals.css';

export const metadata = {
 title: 'DJ Volts — Wired for a Good Time',
 description: 'DJ Volts spins country, top 40 and dance floor classics for weddings, private parties and country nights. By day, an electrician. By night, wired for a good time.',
};

export const viewport = {
 width: 'device-width',
 initialScale: 1,
};

export default function RootLayout({ children }) {
 return (
  <html lang="en">
   <body>
    <Navigation />
    {children}
   </body>
  </html>
 );
}
