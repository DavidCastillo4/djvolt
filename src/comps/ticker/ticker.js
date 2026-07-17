export const Ticker = () => {
 const genres = ['COUNTRY', 'TOP 40', 'CLASSIC ROCK', 'LINE DANCE ANTHEMS', 'WEDDING FIRST DANCES', 'HONKY TONK', 'SPANISH'];

 return (
  <div className="ticker" aria-hidden="true">
   <div className="ticker-track">
    {[...genres, ...genres].map((genre, index) => <span key={`${genre}-${index}`}>{genre}</span>)}
   </div>
  </div>
 );
};
