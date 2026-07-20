import { About } from '@/comps/about/about';
import { Booking } from '@/comps/booking/booking';
import { DanceBackground } from '@/comps/dancebackground/dancebackground';
import { Footer } from '@/comps/footer/footer';
import { Gallery } from '@/comps/gallery/gallery';
import { Hero } from '@/comps/hero/hero';
import { Services } from '@/comps/services/services';
import { Ticker } from '@/comps/ticker/ticker';

export const Djvolts = ({ galleryMedia, content, mediaSettings }) => (
 <>
  <Hero content={content.hero} mediaSettings={mediaSettings} />
  <div className="dance-stage"><DanceBackground mediaSettings={mediaSettings} /><main className="dance-stage-content">
   <Ticker content={content.ticker} /><About content={content.about} /><Services content={content.services} />
   <Gallery mediaItems={galleryMedia} content={content.gallery} /><Booking content={content.booking} />
  </main><Footer content={content.footer} /></div>
 </>
);
