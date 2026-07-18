/* eslint-disable @next/next/no-img-element */
export const About = ({ content }) => {
 const specs = [1,2,3,4,5,6].map((n) => ({ label: content[`label${n}`], value: content[`value${n}`] }));
 return <section className="about" id="about"><div className="wrap"><span className="kicker">{content.kicker}</span><div className="about-grid">
  <div className="about-photo"><img src="/api/images/by-name/about-portrait.jpg" alt="DJ Volts working the booth at a live event" /><div className="tag">{content.photoTag}</div></div>
  <div className="about-copy"><h2>{content.heading}</h2><p>{content.paragraph}</p><div className="nameplate"><div className="nameplate-head"><span>{content.plateTitle}</span><span>{content.plateModel}</span></div><div className="nameplate-grid">{specs.map((s, i) => <div key={i}><label>{s.label}</label><strong>{s.value}</strong></div>)}</div></div></div>
 </div></div></section>;
};
