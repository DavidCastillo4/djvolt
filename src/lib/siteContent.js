export const DEFAULT_SITE_CONTENT = {
 nav: { about: 'About', services: 'Services', gallery: 'Gallery', book: 'Book', cta: 'Get a Quote' },
 hero: {
  eyebrow: 'Now booking weddings & events', titleTop: 'DJ', titleBottom: 'VOLTS',
  tagline: 'Licensed electrician by day. Fully wired for a good time by night. Spanish, Country, top 40 and dance-floor classics, run by a guy who actually reads the dance floor.',
  primaryButton: '⚡ Book The Power', secondaryButton: 'View The Gallery',
  stat1Value: '250+', stat1Label: 'Events Wired', stat2Value: 'Bilingual', stat2Label: 'English - Spanish',
  stat3Value: '2', stat3Label: 'Pro Speaker Rigs', stat4Value: 'Vibe', stat4Label: 'Lights & Smoke'
 },
 ticker: { items: 'COUNTRY|TOP 40|CLASSIC ROCK|LINE DANCE ANTHEMS|WEDDING FIRST DANCES|HONKY TONK|SPANISH', speed: '32' },
 about: {
  kicker: 'The Story', photoTag: '120V & PROUD OF IT', heading: 'Two trades. One guy who shows up early and checks his own wiring',
  paragraph: "By day, he's out running conduit and troubleshooting panels. By night, he's behind the decks — same instinct for making sure everything's connected right, just with a lot more bass.",
  plateTitle: 'Equipment Nameplate', plateModel: 'MODEL: VOLTS-01',
  label1: 'Genres', value1: 'Spanish / Country / Top 40', label2: 'Setup Time', value2: '45–60 min',
  label3: 'Sound Output', value3: '2x Pro Line Array', label4: 'Lighting', value4: 'Uplights + Lasers',
  label5: 'Day Job', value5: 'Licensed Electrician', label6: 'Drink Of Choice', value6: 'Old Fashioned'
 },
 services: {
  kicker: 'Services', heading: "Flip a breaker to see what's on",
  intro: 'Every event gets the same rig, the same attention to detail, and a set list built around your crowd — not a generic top 40 loop.',
  panelTitle: 'Main Panel — Service Menu', powerLabel: 'Power: On',
  service1Title: 'Weddings', service1Description: 'Ceremony sound, cocktail hour playlists, introductions, and a reception that reads the room — not a script.',
  service2Title: 'Private Parties', service2Description: "Anniversaries, graduations and backyard cookouts. Bring the cooler, he'll bring the playlist.",
  service3Title: 'Bars & Breweries', service3Description: 'Line dance nights, live trivia breaks, and sets that keep a bar crowd on their feet until close.',
  service4Title: 'Corporate & Company', service4Description: 'Company parties and events with clean sound, tasteful lighting, and a set list that fits the crowd.'
 },
 gallery: { kicker: 'Gallery', heading: 'From the booth & dance floor', intro: 'Photos and live footage from recent sets — click any moment to see it full size.', scrollSpeed: '5' },
 booking: {
  kicker: 'Booking', heading: "Let's wire up your event", intro: "Reach out with your date, venue and headcount, and you'll get a straight answer on availability and pricing — no runaround.",
  phone: '(512) 557-5987', email: 'info@djvolts.com', instagram: '@djvolts2025',
  ticketTitle: 'Booking Ticket', ticketCode: 'SERVICE CALL',
  row1Label: 'Response time', row1Value: 'Within 24 hrs', row2Label: 'Deposit', row2Value: 'Secures your date',
  row3Label: 'Travel', row3Value: 'Ask about your area', row4Label: 'Setup / breakdown', row4Value: 'Included',
  row5Label: 'Backup equipment', row5Value: 'Always on site'
 },
 footer: { brandTop: 'DJ', brandBottom: 'VOLTS', about: 'About', services: 'Services', gallery: 'Gallery', book: 'Book' }
};

export function mergeSiteContent(saved = {}) {
 const merged = {};
 for (const [section, defaults] of Object.entries(DEFAULT_SITE_CONTENT)) {
  merged[section] = Object.fromEntries(
   Object.keys(defaults).map((key) => [key, saved?.[section]?.[key] ?? defaults[key]])
  );
 }
 return merged;
}
