import { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = GLOSSARY.filter(
      (e) => (category === 'all' || e.category === category) && (!q || [e.term, e.also, e.text].some((s) => s?.toLowerCase().includes(q))),
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
        <label className="sr-only" htmlFor="glossary-search">Search terms</label>
        <input id="glossary-search" className="search search--inline" type="search" placeholder="Search terms" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter by category">
          <button className="chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>All</button>
          {GLOSSARY_CATEGORIES.map((c) => (
            <button key={c} className="chip" aria-pressed={category === c} onClick={() => setCategory(category === c ? 'all' : c)}>{c}</button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="empty">No terms match “{query}”.</p>}

      {groups.map((g) => (
        <section key={g.cat} className="gloss-group" aria-labelledby={`g-${slug(g.cat)}`}>
          <h3 id={`g-${slug(g.cat)}`} className="gloss-group__title">{g.cat}</h3>
          <dl className="gloss">
            {g.entries.map((e) => (
              <div key={e.term} className="gloss__item">
                <dt>
                  <span className="gloss__term">{e.term}</span>
                  {e.also && <span className="gloss__also">{e.also}</span>}
                </dt>
                <dd>
                  {e.text}
                  {e.related && <span className="gloss__related"> See also: {e.related.join(', ')}.</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
