import Mascot from './components/Mascot.jsx';
import SocialLinks from './components/SocialLinks.jsx';

// Placeholder shell. Same masthead and footer as the NTE Team Builder; the
// builder itself arrives once the game data is in src/data.
const PLANNED = [
  {
    id: 'agents',
    title: 'Agents',
    text: 'Browse every Agent by attribute, specialty, faction and rank, with skills and recommended builds.',
  },
  {
    id: 'w-engines',
    title: 'W-Engines',
    text: 'Find the right W-Engine for each Agent, from signature picks to solid alternatives.',
  },
  {
    id: 'drive-discs',
    title: 'Drive Discs',
    text: 'Compare set bonuses and plan main and sub stats for every slot.',
  },
  {
    id: 'bangboo',
    title: 'Bangboo',
    text: 'See which Bangboo fit a squad and what they bring to it.',
  },
  {
    id: 'teams',
    title: 'Saved teams',
    text: 'Build and save multiple squads, check their synergy and share them with a short code.',
  },
];

export default function App() {
  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <header className="masthead">
        <div className="masthead__line" aria-hidden="true" />
        <div className="masthead__row">
          <div className="brand-wrap">
            <Mascot />
            <h1 className="brand">
              <span className="brand__small">Zenless Zone Zero</span>
              Team Builder
            </h1>
          </div>
        </div>
        <p className="masthead__meta">Unofficial fan project · Not affiliated with HoYoverse</p>
      </header>

      <main className="soon">
        <section className="soon__hero" aria-labelledby="soon-title">
          <p className="soon__tag">Under construction</p>
          <h2 id="soon-title" className="soon__title">Cortado is setting up shop in New Eridu.</h2>
          <p className="soon__lead">
            The team builder is on its way. Here is what it will cover. Tap Cortado up there while you wait.
          </p>
        </section>

        <ul className="soon__grid">
          {PLANNED.map((p) => (
            <li key={p.id} className="soon__card">
              <h3 className="soon__card-title">{p.title}</h3>
              <p className="soon__card-text">{p.text}</p>
              <span className="soon__status">Coming soon</span>
            </li>
          ))}
        </ul>
      </main>

      <footer className="foot">
        <SocialLinks />
        <p className="foot__notes">
          This site has no accounts, ads or tracking. Game data will be compiled from community sources and may lag
          behind patches. Zenless Zone Zero and all related content belong to HoYoverse.
        </p>
      </footer>
    </div>
  );
}
