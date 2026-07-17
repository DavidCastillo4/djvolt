import { About } from '@/comps/about/about';
import { Booking } from '@/comps/booking/booking';
import { Footer } from '@/comps/footer/footer';
import { Gallery } from '@/comps/gallery/gallery';
import { Hero } from '@/comps/hero/hero';
import { Services } from '@/comps/services/services';
import { Ticker } from '@/comps/ticker/ticker';

export const Djvolts = ({ galleryMedia }) => (
 <>
  <main>
   <Hero />
   <Ticker />
   <About />
   <Services />
   <Gallery mediaItems={galleryMedia} />
   <Booking />
  </main>
  <Footer />
 </>
);
