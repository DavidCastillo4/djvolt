'use client';

import { useState } from 'react';

const serviceItems = [
 { title: 'Weddings', description: 'Ceremony sound, cocktail hour playlists, introductions, and a reception that reads the room — not a script.' },
 { title: 'Private Parties', description: 'Anniversaries, graduations and backyard cookouts. Bring the cooler, he\'ll bring the playlist.' },
 { title: 'Bars & Breweries', description: 'Line dance nights, live trivia breaks, and sets that keep a bar crowd on their feet until close.' },
 { title: 'Corporate & Company Events', description: 'Company parties and events with clean sound, tasteful lighting, and a set list that fits the crowd.' },
];

export const Services = () => {
 const [activeService, setActiveService] = useState(0);

 return (
  <section className="panel-section" id="services">
   <div className="wrap">
    <div className="section-head">
     <span className="kicker">Services</span>
     <h2>Flip a breaker to see what&apos;s on.</h2>
     <p>Every event gets the same rig, the same attention to detail, and a set list built around your crowd — not a generic top 40 loop.</p>
    </div>
    <div className="breaker-box">
     <div className="breaker-box-head">
      <span>Main Panel — Service Menu</span>
      <span className="lamp"><i></i>Power: On</span>
     </div>
     <div className="breakers">
      {serviceItems.map((service, index) => {
       const isActive = activeService === index;
       return (
        <button
         className={`breaker${isActive ? ' active' : ''}`}
         key={service.title}
         type="button"
         onClick={() => setActiveService(index)}
        >
         <span className="breaker-status">{isActive ? 'ON' : 'OFF'}</span>
         <span className="breaker-num">CKT {String(index + 1).padStart(2, '0')}</span>
         <div className="switch"></div>
         <h3>{service.title}</h3>
         <p>{service.description}</p>
        </button>
       );
      })}
     </div>
    </div>
   </div>
  </section>
 );
};
