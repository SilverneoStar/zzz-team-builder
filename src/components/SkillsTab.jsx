import { useEffect, useState } from 'react';
import { useShowBeta } from '../lib/betaInfo.js';
import BetaHidden from './BetaHidden.jsx';
import { passiveCondition, passiveStatus } from '../lib/analyze.js';

// One small JSON file per Agent, loaded only when their Skills tab opens.
const FILES = import.meta.glob('../data/skills/*.json', { import: 'default' });
const fileFor = (id) => FILES[`../data/skills/${id}.json`];
export const hasSkills = (id) => Boolean(fileFor(id));

const CATS = ['Basic Attack', 'Dodge', 'Assist', 'Special Attack', 'Chain Attack'];
const ICON = {
  'Basic Attack': 'basic',
  Dodge: 'dodge',
  Assist: 'assist',
  'Special Attack': 'special',
  'Chain Attack': 'chain',
  'Core Passive': 'core',
};
// The in-game skill-type icons in public/skills/<name>.webp.
const SkillIcon = ({ cat }) =>
  ICON[cat] ? (
    <img
      className="skills__icon"
      src={`${import.meta.env.BASE_URL}skills/${ICON[cat]}.webp`}
      alt=""
      width="28"
      height="28"
      loading="lazy" decoding="async"
    />
  ) : null;

const LEVELS = ['Base', 'A', 'B', 'C', 'D', 'E', 'F'];
const WIKI = 'https://zenless-zone-zero.fandom.com/wiki/';

// Puts the numbers for the chosen level into "{0}", "{1}" … in a summary.
function fill(text, values) {
  return text.split(/(\{\d+\})/).map((part, i) => {
    const m = part.match(/^\{(\d+)\}$/);
    return m ? (
      <b key={i} className="skills__num">
        {values[Number(m[1])] ?? '?'}
      </b>
    ) : (
      part
    );
  });
}

const paras = (text, values = []) => text.split('\n').map((line, i) => <p key={i}>{fill(line, values)}</p>);

// The Agent page's Skills tab: every skill in short, the Core Passive at each
// level (Base, A–F), the Additional Ability and whether the current team turns
// it on, Mindscapes, and Potential where the Agent has one.
export default function SkillsTab({ agent: a, team }) {
  const [kit, setKit] = useState(null);
  const [failed, setFailed] = useState(false);
  const showBeta = useShowBeta();

  useEffect(() => {
    let live = true;
    setKit(null);
    setFailed(false);
    const load = fileFor(a.id);
    if (load)
      load()
        .then((k) => live && setKit(k))
        .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [a.id]);

  if (!fileFor(a.id)) {
    return (
      <section className="skills">
        <h3 className="mini-title">Skills</h3>
        <p className="muted small">
          {a.upcoming
            ? `${a.name}’s skills arrive here once they’re released.`
            : `${a.name}’s skill summaries are on the way.`}
        </p>
      </section>
    );
  }
  if (failed)
    return <p className="muted small">Couldn’t load the skills. Check your connection and reopen this tab.</p>;
  if (!kit)
    return (
      <p className="muted small" role="status">
        Loading skills…
      </p>
    );

  if (kit.beta && !showBeta)
    return (
      <section className="skills">
        <h3 className="mini-title">Skills</h3>
        <BetaHidden what={`${a.name}’s kit`} />
      </section>
    );

  const inTeam = team?.members.includes(a.id);
  const mindscape = inTeam ? (team.loadouts?.[a.id]?.mindscape ?? 0) : null;

  return (
    <section className="skills">
      <h3 className="mini-title">Skills</h3>
      <p className="muted small">Short summaries in plain words, with the game’s numbers. Tap a section to open it.</p>

      {CATS.map((cat) => {
        const list = kit.skills.filter((s) => s[0] === cat);
        if (!list.length) return null;
        return (
          <details key={cat} className="skills__group">
            <summary>
              <SkillIcon cat={cat} />
              <span className="skills__cat">{cat}</span>
              <span className="skills__peek">{[...new Set(list.map((s) => s[2]))].join(' · ')}</span>
            </summary>
            <ul className="skills__list">
              {list.map(([, kind, name, text]) => (
                <li key={kind + name}>
                  <span className="skills__kind">{kind}</span>
                  <b className="skills__name">{name}</b>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </details>
        );
      })}

      <Core core={kit.core} />
      {kit.ability && <Ability agent={a} ability={kit.ability} team={inTeam ? team : null} />}
      {kit.mindscapes?.length > 0 && <Mindscapes list={kit.mindscapes} current={mindscape} />}
      {kit.potential && (
        <Potential potential={kit.potential} current={inTeam ? (team.loadouts?.[a.id]?.potential ?? 0) : null} />
      )}

      {kit.source ? (
        <p className="muted small skills__src">
          {kit.beta && (
            <>
              <span className="card__tag card__tag--warn">Beta</span>{' '}
            </>
          )}
          {a.upcoming && !a.version && !kit.beta && (
            <>
              <span className="card__tag card__tag--warn">Subject to change</span>{' '}
            </>
          )}
          {kit.source}
        </p>
      ) : (
        <p className="muted small skills__src">
          Skill details from the{' '}
          <a href={WIKI + a.name.replace(/ /g, '_')} target="_blank" rel="noreferrer">
            Zenless Zone Zero Wiki
          </a>{' '}
          (CC BY-SA), summarised.
        </p>
      )}
    </section>
  );
}

function LevelPicker({ labels, value, onChange, name }) {
  return (
    <div className="skills__levels" role="radiogroup" aria-label={name}>
      {labels.map((l, i) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={value === i}
          className={`skills__level${value === i ? ' is-on' : ''}`}
          onClick={() => onChange(i)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Core({ core }) {
  const [lv, setLv] = useState(LEVELS.length - 1);
  const keys = Object.keys(core.values);
  const vals = keys.map((k) => core.values[k][lv]);
  const used = new Set([...core.text.matchAll(/\{(\d+)\}/g)].map((m) => Number(m[1])));
  const extra = keys.filter((_, i) => !used.has(i));
  return (
    <details className="skills__group">
      <summary>
        <SkillIcon cat="Core Passive" />
        <span className="skills__cat">Core Passive</span>
        <span className="skills__peek">{core.name}</span>
      </summary>
      <div className="skills__body">
        {keys.length > 0 && <LevelPicker labels={LEVELS} value={lv} onChange={setLv} name="Core Passive level" />}
        {paras(core.text, vals)}
        {extra.length > 0 && (
          <dl className="skills__values">
            {extra.map((k) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{core.values[k][lv]}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </details>
  );
}

function Ability({ agent: a, ability, team }) {
  const s = team ? passiveStatus(team.members).byId[a.id] : null;
  return (
    <details className="skills__group">
      <summary>
        <span className="skills__cat">Additional Ability</span>
        <span className="skills__peek">{ability.name}</span>
        {s && <span className={`skills__state${s.active ? ' is-on' : ''}`}>{s.active ? 'On' : 'Off'}</span>}
      </summary>
      <div className="skills__body">
        {paras(ability.text)}
        <p className="muted small">
          {s
            ? s.active
              ? `On in your current team, thanks to ${s.via.join(', ')}.`
              : `Off in your current team. Turns on with: ${passiveCondition(a.id)}.`
            : `Turns on with: ${passiveCondition(a.id)}.`}
        </p>
      </div>
    </details>
  );
}

function Mindscapes({ list, current }) {
  return (
    <details className="skills__group">
      <summary>
        <span className="skills__cat">Mindscapes</span>
        <span className="skills__peek">{current == null ? 'M1–M6' : `Your team: M${current}`}</span>
      </summary>
      <ol className="skills__ms">
        {list.map((t, i) => (
          <li key={i} className={current != null && i < current ? 'is-on' : ''}>
            <span className="skills__ms-n">M{i + 1}</span>
            <p>{t}</p>
          </li>
        ))}
      </ol>
    </details>
  );
}

function Potential({ potential: p, current }) {
  const [lv, setLv] = useState(current || 1);
  const aw = p.awakened;
  const awIdx = lv - (aw?.from ?? 2);
  return (
    <details className="skills__group">
      <summary>
        <span className="skills__cat">Potential</span>
        <span className="skills__peek">
          {p.name}
          {current != null
            ? ` · Your team: ${current ? ['I', 'II', 'III', 'IV', 'V', 'VI'][current - 1] : 'none'}`
            : ''}
        </span>
      </summary>
      <div className="skills__body">
        <LevelPicker
          labels={['I', 'II', 'III', 'IV', 'V', 'VI']}
          value={lv - 1}
          onChange={(i) => setLv(i + 1)}
          name="Potential level"
        />
        <p className="small">
          <b>
            {p.name} {['I', 'II', 'III', 'IV', 'V', 'VI'][lv - 1]}:
          </b>{' '}
          {p.levels[lv - 1]}
        </p>
        <h4 className="micro-title">Upgraded skills</h4>
        {p.note && <p className="muted small">{p.note}</p>}
        <ul className="skills__list">
          {p.skills.map(([kind, name, text]) => (
            <li key={kind + name}>
              <span className="skills__kind">{kind}</span>
              <b className="skills__name">{name}</b>
              <p>{text}</p>
            </li>
          ))}
        </ul>
        {aw && (
          <>
            <h4 className="micro-title">Awakened Potential · {aw.name}</h4>
            {awIdx >= 0 ? (
              paras(
                aw.text,
                aw.values.map((v) => v[awIdx]),
              )
            ) : (
              <p className="muted small">Unlocks at {p.name} II.</p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
