import { useMemo, useState } from 'react';
import { FACTION_NOTES, FACTION_PARENT, GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js';
import { AGENTS, BANGBOO } from '../data/game.js';
import FactionLogo from './FactionLogo.jsx';

// One Factions entry per faction an Agent or Bangboo belongs to, plus the
// departments a several-member Agent's members run (Sunbringer's sisters).
const FACTION_ENTRIES = (() => {
  const people = {};
  const add = (f, label, href) => f && (people[f] ??= []).push({ label, href });
  AGENTS.forEach((a) => {
    add(a.faction, a.name, `#agent-${a.id}`);
    a.members?.forEach((m) => add(m.faction, m.name, `#agent-${a.id}`));
  });
  BANGBOO.forEach((b) => add(b.faction, `${b.name} (Bangboo)`, `#bangboo-${b.id}`));
  return Object.keys(people).map((f) => ({
    term: f,
    also: FACTION_PARENT[f] ? `Part of ${FACTION_PARENT[f]}` : undefined,
    category: 'Factions',
    text: FACTION_NOTES[f] ?? '',
    faction: f,
    members: people[f],
  }));
})();
const ALL = [...GLOSSARY, ...FACTION_ENTRIES];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ALL.filter(
      (e) =>
        (category === 'all' || e.category === category) &&
        (!q || [e.term, e.also, e.text, ...(e.members ?? []).map((m) => m.label)].some((s) => s?.toLowerCase().includes(q))),
    );
    return GLOSSARY_CATEGORIES.map((cat) => ({
      cat,
      entries: matches.filter((e) => e.category === cat).sort((a, b) => a.term.localeCompare(b.term)),
    })).filter((g) => g.entries.length > 0);
  }, [query, category]);

  return (
    <div className="page">
      <header className="page__head">
        <h2 className="page__title">Glossary</h2>
        <p className="muted">Game terms used across ZZZ and this app.</p>
      </header>

      <div className="filters filters--page">
        <label className="sr-only" htmlFor="glossary-search">
          Search terms
        </label>
        <input
          id="glossary-search"
          className="search search--inline"
          type="search"
          placeholder="Search terms"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter by category">
          <button className="chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
            All
          </button>
          {GLOSSARY_CATEGORIES.map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(category === c ? 'all' : c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="empty">No terms match “{query}”.</p>}

      {groups.map((g) => (
        <section key={g.cat} className="gloss-group" aria-labelledby={`g-${slug(g.cat)}`}>
          <h3 id={`g-${slug(g.cat)}`} className="gloss-group__title">
            {g.cat}
          </h3>
          <dl className="gloss">
            {g.entries.map((e) => (
              <div key={e.term} className="gloss__item">
                <dt>
                  {e.faction && <FactionLogo faction={e.faction} size={24} />}
                  <span className="gloss__term">{e.term}</span>
                  {e.also && <span className="gloss__also">{e.also}</span>}
                </dt>
                <dd>
                  {e.text}
                  {e.related && <span className="gloss__related"> See also: {e.related.join(', ')}.</span>}
                  {e.members && (
                    <span className="gloss__members">
                      {e.text && ' '}Members:{' '}
                      {e.members.map((m, i) => (
                        <span key={m.label}>
                          {i > 0 && ', '}
                          <a href={m.href}>{m.label}</a>
                        </span>
                      ))}
                      .
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
