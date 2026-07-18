import { About } from '@/comps/about/about';
import { Booking } from '@/comps/booking/booking';
import { DanceBackground } from '@/comps/dancebackground/dancebackground';
import { Footer } from '@/comps/footer/footer';
import { Gallery } from '@/comps/gallery/gallery';
import { Hero } from '@/comps/hero/hero';
import { Services } from '@/comps/services/services';
import { Ticker } from '@/comps/ticker/ticker';

export const Djvolts = ({ galleryMedia }) => (
 <>
  <Hero />
  <div className="dance-stage">
   <DanceBackground />
   <main className="dance-stage-content">
    <Ticker />
    <About />
    <Services />
    <Gallery mediaItems={galleryMedia} />
    <Booking />
   </main>
   <Footer />
  </div>
 </>
);
