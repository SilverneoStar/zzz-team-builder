// Upload pictures to fill in a build: the site's own team and build images
// (their code), or in-game screenshots of an Agent: Base Stats, Equipment and
// the six Drive Disc screens. Everything is read on this device
// (lib/screenshots.js); the pictures aren't uploaded or kept.
import { useRef, useState } from 'react';
import { AGENT_BY_ID, DRIVE_DISC_BY_ID, W_ENGINE_BY_ID } from '../data/game.js';
import { readScreenshot } from '../lib/screenshots.js';
import { normaliseDiscs } from '../lib/discs.js';

const describe = (r) => {
  if (r.kind === 'code') {
    const who = r.team.members.filter(Boolean).map((id) => AGENT_BY_ID[id]?.name).join(', ');
    return `${r.team.members.filter(Boolean).length > 1 ? 'Team' : 'Build'} code for ${who}${r.exact ? '' : ' (read from the picture)'}`;
  }
  if (r.kind === 'disc') {
    const subs = r.subs.map((x) => `${x.stat}${x.up ? ` +${x.up}` : ''}`).join(', ');
    return `Slot ${r.slot}: ${r.setName ?? 'unknown set'} (${r.rank})${r.main ? ` · ${r.main}` : ''}${subs ? ` · ${subs}` : ''}`;
  }
  if (r.kind === 'skills')
    return r.levels ? `Skills: ${r.levels.join(' · ')} (Basic, Dodge, Assist, Special, Chain)` : 'Skills tab: the levels couldn’t be read. Set them under Skills.';
  if (r.kind === 'engine') return `W-Engine: ${r.name}${r.phase ? ` · Phase ${r.phase}` : ''}`;
  if (r.kind === 'stats')
    return `Base Stats${r.agentId ? ` for ${AGENT_BY_ID[r.agentId].name}` : ''}${r.active != null ? ` · Active Modifier Count ${r.active}` : ''}`;
  return r.reason === 'code' ? 'Found a code but couldn’t read it clearly. Try the saved image, or paste the code.' : 'Nothing the site can use in this picture.';
};

/**
 * agent: the Agent being edited (null in the team builder, which only takes codes).
 * onBuild(loadout): fill the build. onCode(team): a team or build code was found.
 */
export default function ScreenshotReader({ agent, loadout, onBuild, onCode, codesOnly = false }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  async function read(files) {
    setError('');
    setResults([]);
    const out = [];
    for (const [i, f] of [...files].entries()) {
      setBusy({ n: i + 1, of: files.length, p: 0 });
      try {
        const r = await readScreenshot(f, (p) => setBusy({ n: i + 1, of: files.length, p }));
        out.push({ ...r, file: f.name });
      } catch (e) {
        // One picture failing doesn't stop the rest; the reader not loading does.
        if (/text reader/.test(e.message ?? '')) {
          setError(e.message);
          break;
        }
        out.push({ kind: 'unknown', file: f.name, failed: true });
      }
    }
    setBusy(null);
    if (input.current) input.current.value = ''; // forget the files
    const codes = out.filter((r) => r.kind === 'code');
    if (codes.length && onCode) onCode(codes[0].team);
    setResults(out);
  }

  // What the screenshots add to this Agent's build.
  const usable = results.filter(
    (r) => r.kind === 'disc' || r.kind === 'engine' || (r.kind === 'skills' && r.levels) || (r.kind === 'stats' && r.agentId === agent?.id),
  );
  const wrongAgent = results.find((r) => (r.kind === 'stats' || r.kind === 'engine') && r.agentId && agent && r.agentId !== agent.id);

  function apply() {
    let next = { ...loadout, discs: loadout.discs.map((d) => ({ ...d })) };
    results.forEach((r) => {
      if (r.kind === 'disc') {
        next.discs[r.slot - 1] = { set: r.set, rank: r.rank, main: r.main, subs: r.subs, four: r.four };
      } else if (r.kind === 'engine' && W_ENGINE_BY_ID[r.wEngine]) {
        next = { ...next, wEngine: r.wEngine, ...(r.phase ? { refinement: r.phase } : {}) };
      }
    });
    next.discs = normaliseDiscs(next.discs);
    const sk = results.find((r) => r.kind === 'skills' && r.levels);
    onBuild(next, sk ? { levels: sk.levels } : null);
    setResults([]);
  }

  const gameCount = results.find((r) => r.kind === 'stats' && r.active != null)?.active;

  return (
    <div className="shots">
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={!codesOnly}
        hidden
        onChange={(e) => e.target.files?.length && read(e.target.files)}
      />
      <button type="button" className="btn" onClick={() => input.current?.click()} disabled={!!busy}>
        {busy ? `Reading ${busy.n} of ${busy.of}… ${Math.round(busy.p * 100)}%` : codesOnly ? 'Read a code from an image' : 'Upload screenshots'}
      </button>
      <p className="muted small shots__hint">
        {codesOnly
          ? 'A team or build image from this site.'
          : 'A team or build image from this site, or in-game screenshots of this Agent: Base Stats, Equipment and each Drive Disc (tap a disc in the Equipment tab).'}{' '}
        Pictures are read on your device and aren’t uploaded or saved. The first time, the text reader (a few MB)
        is downloaded.
      </p>
      {error && (
        <p className="mybuild__error" role="alert">
          {error}
        </p>
      )}
      {results.length > 0 && (
        <div className="shots__results">
          <ul>
            {results.map((r, i) => (
              <li key={`${r.file}-${i}`} className={`shots__r shots__r--${r.kind}`}>
                {describe(r)}
              </li>
            ))}
          </ul>
          {wrongAgent && (
            <p className="small mybuild__error">
              These look like {AGENT_BY_ID[wrongAgent.agentId].name}’s screens. Open their page to use them.
            </p>
          )}
          {gameCount != null && (
            <p className="small muted">
              The game’s Active Modifier Count is {gameCount}. Compare it with the count under Stats from discs once
              all six discs are in.
            </p>
          )}
          {!codesOnly && usable.some((r) => r.kind !== 'stats') && !wrongAgent && (
            <button type="button" className="btn btn--primary" onClick={apply}>
              Use {usable.filter((r) => r.kind !== 'stats').length === 1 ? 'this' : 'these'} in my build
            </button>
          )}
        </div>
      )}
    </div>
  );
}
