export const Booking = ({ content }) => {
 const phoneHref = `tel:${String(content.phone).replace(/[^+\d]/g,'')}`;
 const emailHref = `mailto:${content.email}`;
 return <section className="book" id="book"><div className="wrap"><div className="book-heading"><span className="kicker">{content.kicker}</span><h2>{content.heading}</h2></div><div className="book-grid"><div className="book-contact"><p>{content.intro}</p><ul className="contact-list">
  <li><a href={phoneHref}><span className="ic">☎</span>{content.phone}</a></li><li><a href={emailHref}><span className="ic">✉</span>{content.email}</a></li><li><a href="https://instagram.com/djvolts2025" target="_blank" rel="noopener noreferrer"><span className="ic">◎</span>{content.instagram}</a></li>
 </ul></div><div className="service-ticket"><div className="nameplate-head" style={{ margin:'-28px -28px 18px', borderRadius:'8px 8px 0 0' }}><span>{content.ticketTitle}</span><span>{content.ticketCode}</span></div>
 {[1,2,3,4,5].map((n)=><div className="service-ticket-row" key={n}><span>{content[`row${n}Label`]}</span><span>{content[`row${n}Value`]}</span></div>)}</div></div></div></section>;
};
