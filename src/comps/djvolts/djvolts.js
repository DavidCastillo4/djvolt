import { About } from '@/comps/about/about';
import { Booking } from '@/comps/booking/booking';
import { Footer } from '@/comps/footer/footer';
import { Gallery } from '@/comps/gallery/gallery';
import { Hero } from '@/comps/hero/hero';
import { LiveFootage } from '@/comps/livefootage/livefootage';
import { Services } from '@/comps/services/services';
import { Ticker } from '@/comps/ticker/ticker';

export const Djvolts = ({ galleryImages }) => (
 <>
  <main>
   <Hero />
   <Ticker />
   <About />
   <Services />
   <Gallery images={galleryImages} />
   <LiveFootage />
   <Booking />
  </main>
  <Footer />
 </>
);
