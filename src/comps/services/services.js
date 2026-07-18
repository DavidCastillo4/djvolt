'use client';
import { useState } from 'react';
export const Services = ({ content }) => {
 const [activeService, setActiveService] = useState(0);
 const items = [1,2,3,4].map((n) => ({ title: content[`service${n}Title`], description: content[`service${n}Description`] }));
 return <section className="panel-section" id="services"><div className="wrap"><div className="section-head"><span className="kicker">{content.kicker}</span><h2>{content.heading}</h2><p>{content.intro}</p></div>
  <div className="breaker-box"><div className="breaker-box-head"><span>{content.panelTitle}</span><span className="lamp"><i></i>{content.powerLabel}</span></div><div className="breakers">{items.map((service,index) => { const active=activeService===index; return <button className={`breaker${active?' active':''}`} key={index} type="button" onClick={() => setActiveService(index)}><span className="breaker-status">{active?'ON':'OFF'}</span><span className="breaker-num">CKT {String(index+1).padStart(2,'0')}</span><div className="switch"></div><h3>{service.title}</h3><p>{service.description}</p></button>; })}</div></div>
 </div></section>;
};
