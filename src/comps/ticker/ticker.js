export const Ticker = ({ content }) => {
 const genres = String(content?.items || '')
  .split('|')
  .map((item) => item.trim())
  .filter(Boolean);

 const requestedSpeed = Number(content?.speed);
 const durationSeconds = Number.isFinite(requestedSpeed)
  ? Math.min(60, Math.max(12, requestedSpeed))
  : 32;

 return (
  <div className="ticker" aria-hidden="true">
   <div
    key={durationSeconds}
    className="ticker-track"
    style={{ animationDuration: `${durationSeconds}s` }}
   >
    {[...genres, ...genres].map((genre, index) => (
     <span key={`${genre}-${index}`}>{genre}</span>
    ))}
   </div>
  </div>
 );
};
