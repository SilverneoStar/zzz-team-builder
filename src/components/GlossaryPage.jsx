import { useEffect, useMemo, useState } from 'react';
import { FACTION_MORE, FACTION_NOTES, FACTION_PARENT, GLOSSARY, GLOSSARY_CATEGORIES } from '../data/glossary.js';
import { AGENTS, BANGBOO } from '../data/game.js';
import FactionLogo from './FactionLogo.jsx';
import ViewToggle from './ViewToggle.jsx';
import { agentArt } from './Portrait.jsx';
import { bangbooArt } from './BangbooArt.jsx';
import { ITEMS, ITEM_GROUPS } from '../data/items.js';
import { MatIcon } from './MaterialsTab.jsx';
import { AGENT_BY_ID, ATTRIBUTE_BY_ID, SPECIALTY_BY_ID } from '../data/game.js';
import SpecialtyIcon from './SpecialtyIcon.jsx';
import AttributeGlyph from './AttributeGlyph.jsx';
import Portrait from './Portrait.jsx';

const BASE = import.meta.env.BASE_URL;
const VIEW_KEY = 'zzz-team-builder:factionView';
const loadView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
};

// One Factions entry per faction an Agent or Bangboo belongs to, plus the
// departments a several-member Agent's members run (Sunbringer's sisters).
const FACTION_ENTRIES = (() => {
  const people = {};
  const add = (f, label, href, img, bangboo = false) => f && (people[f] ??= []).push({ label, href, img, bangboo });
  AGENTS.forEach((a) => {
    add(
      a.faction,
      a.name,
      `#agent-${a.id}`,
      a.members ? `${BASE}agents/${a.id}-${a.members[0].key}.webp` : agentArt(a.id),
    );
    a.members?.forEach((m) => add(m.faction, m.name, `#agent-${a.id}`, `${BASE}agents/${a.id}-${m.key}.webp`));
  });
  BANGBOO.forEach((b) => add(b.faction, `${b.name} (Bangboo)`, `#bangboo-${b.id}`, bangbooArt(b.id), true));
  return Object.keys(people).map((f) => ({
    term: f,
    also: FACTION_PARENT[f] ? `Part of ${FACTION_PARENT[f]}` : undefined,
    category: 'Factions',
    text: FACTION_NOTES[f] ?? '',
    faction: f,
    members: people[f],
    more: FACTION_MORE[f],
  }));
})();
const ALL = [...GLOSSARY, ...FACTION_ENTRIES];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function GlossaryPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  // Factions can be shown as a list (like the other terms) or as cards.
  const [view, setView] = useState(loadView);
  // Items show one group at a time (searching looks through all of them).
  const [itemGroup, setItemGroup] = useState(ITEM_GROUPS[0]);
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* storage unavailable */
    }
  }, [view]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ALL.filter(
      (e) =>
        (category === 'all' || e.category === category) &&
        (!q ||
          [e.term, e.also, e.text, ...(e.more ?? []), ...(e.members ?? []).map((m) => m.label)].some((s) =>
            s?.toLowerCase().includes(q),
          )),
    );
    return GLOSSARY_CATEGORIES.map((cat) => ({
      cat,
      entries: matches.filter((e) => e.category === cat).sort((a, b) => a.term.localeCompare(b.term)),
    })).filter((g) => g.entries.length > 0);
  }, [query, category]);

  const itemGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Under All, items only appear for a search; under Items, one group at a time.
    if (category === 'all' ? !q : category !== 'Items') return [];
    const hit = (it) => !q || [it.name, ...it.names, it.text, ...it.get, it.group].some((s) => s.toLowerCase().includes(q));
    return ITEM_GROUPS.filter((g) => q || g === itemGroup)
      .map((g) => ({ g, items: ITEMS.filter((it) => it.group === g && hit(it)) }))
      .filter((x) => x.items.length);
  }, [query, category, itemGroup]);

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
          {[...GLOSSARY_CATEGORIES, 'Items'].map((c) => (
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

      {category === 'Items' && (
        <div className="chips items-chips" role="group" aria-label="Item groups">
          {ITEM_GROUPS.map((g) => (
            <button
              key={g}
              className="chip"
              aria-pressed={!query.trim() && itemGroup === g}
              onClick={() => {
                setItemGroup(g);
                setQuery('');
              }}
            >
              {g} <span className="chip__n">{ITEMS.filter((it) => it.group === g).length}</span>
            </button>
          ))}
        </div>
      )}

      {groups.length === 0 && itemGroups.length === 0 && <p className="empty">No terms match “{query}”.</p>}

      {groups.map((g) => (
        <section key={g.cat} className="gloss-group" aria-labelledby={`g-${slug(g.cat)}`}>
          <div className="gloss-group__head">
            <h3 id={`g-${slug(g.cat)}`} className="gloss-group__title">
              {g.cat}
            </h3>
            {g.cat === 'Factions' && <ViewToggle view={view} onChange={setView} />}
          </div>
          {g.cat === 'Factions' && view === 'grid' ? (
            <ul className="fac-grid">
              {g.entries.map((e) => (
                <li key={e.term} className="fac-card">
                  <div className="fac-card__logo">
                    <FactionLogo faction={e.faction} size={96} />
                  </div>
                  <h4 className="fac-card__name">{e.term}</h4>
                  {e.also && <p className="fac-card__also">{e.also}</p>}
                  {e.text && <p className="fac-card__text">{e.text}</p>}
                  <ul className="fac-card__members" aria-label="Members">
                    {e.members.map((m) => (
                      <li key={m.label}>
                        <a href={m.href} title={m.label} className={m.bangboo ? 'is-bangboo' : undefined}>
                          <img src={m.img} alt={m.label} loading="lazy" decoding="async" />
                        </a>
                      </li>
                    ))}
                  </ul>
                  {e.more && (
                    <details className="gloss__more">
                      <summary>More</summary>
                      <ul>
                        {e.more.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <dl className="gloss">
              {g.entries.map((e) => (
                <div key={e.term} className="gloss__item">
                  <dt>
                    {e.faction && <FactionLogo faction={e.faction} size={56} />}
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
                    {e.more && (
                      <details className="gloss__more">
                        <summary>More about {e.term}</summary>
                        <ul>
                          {e.more.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}

      {itemGroups.length > 0 && (
        <section className="gloss-group" aria-labelledby="g-items">
          <h3 id="g-items" className="gloss-group__title">
            Items
          </h3>
          <p className="muted small">What each material is for, where to get it, and which Agents or W-Engines use it.</p>
          {itemGroups.map(({ g, items }) => (
            <div key={g} className="items-group">
              <h4 className="micro-title">{g}</h4>
              <ul className="items">
                {items.map((it) => (
                  <ItemCard key={it.name} item={it} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

const USED_SHOWN = 8;
const TIER_LABEL = ['T1', 'T2', 'T3'];

function ItemCard({ item: it }) {
  const [open, setOpen] = useState(false);
  const used = open ? it.agents : it.agents.slice(0, USED_SHOWN);
  const tiered = it.names.length > 1;
  return (
    <li className={`item${tiered ? ' item--family' : ''}`} id={`item-${slug(it.name)}`}>
      <span className="item__icons">
        {it.names.map((n, i) => (
          <span key={n} className={`item__icon${tiered ? ` item--t${i + 1}` : ''}`} title={n}>
            <MatIcon item={{ name: n, kind: 'seal' }} />
          </span>
        ))}
      </span>
      <div className="item__body">
        <b className="item__name">{it.name}</b>
        {tiered && (
          <ol className="item__tiers">
            {it.names.map((n, i) => (
              <li key={n} className={`item--t${i + 1}`}>
                <span className="item__tier">{TIER_LABEL[i]}</span> {n}
              </li>
            ))}
          </ol>
        )}
        <p className="item__text">{it.text}</p>
        <p className="item__label">How to get</p>
        <ul className="item__get">
          {it.get.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        {it.for && (
          <>
            <p className="item__label">Used by</p>
            <p className="item__for">
              {it.for.specialty ? (
                <>
                  <SpecialtyIcon specialty={it.for.specialty} size={20} />
                  {SPECIALTY_BY_ID[it.for.specialty]?.name} {it.for.wEngines ? 'W-Engines' : 'Agents'}
                </>
              ) : (
                <>
                  <AttributeGlyph attribute={it.for.attribute} size={20} />
                  {ATTRIBUTE_BY_ID[it.for.attribute]?.name} Agents
                </>
              )}
            </p>
          </>
        )}
        {it.agents.length > 0 && (
          <>
            <p className="item__label">Used by</p>
            <div className="item__used">
              {used.map((id) => (
                <a key={id} href={`#agent-${id}`} title={AGENT_BY_ID[id]?.name}>
                  <Portrait agent={AGENT_BY_ID[id]} size="sm" />
                </a>
              ))}
              {it.agents.length > USED_SHOWN && (
                <button type="button" className="item__more" onClick={() => setOpen(!open)} aria-expanded={open}>
                  {open ? 'Show fewer' : `+${it.agents.length - USED_SHOWN}`}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </li>
  );
}
