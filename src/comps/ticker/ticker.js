export const Ticker = ({ content }) => {
 const genres = String(content.items || '').split('|').map((item) => item.trim()).filter(Boolean);
 return <div className="ticker" aria-hidden="true"><div className="ticker-track">{[...genres,...genres].map((genre,index) => <span key={`${genre}-${index}`}>{genre}</span>)}</div></div>;
};
