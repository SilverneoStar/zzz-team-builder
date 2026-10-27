// The whole site: the masthead and page tabs, the team builder (squad slots,
// gear panel, synergy and sharing), and the other pages, chosen by the address
// after # (see lib/route.js). Teams live in a reducer (lib/teamsReducer.js) and
// are saved in this browser (lib/storage.js).
import { useShowBeta } from './lib/betaInfo.js';
import { Suspense, lazy, useEffect, useMemo, useReducer, useState } from 'react';
import { AGENT_BY_ID, DATA_VERSION } from './data/game.js';
import { analyzeTeam, usageInOtherTeams } from './lib/analyze.js';
import { navigate, useHashRoute, VIEWS } from './lib/route.js';
import { SCALE_OPTIONS, useDisplayScale } from './lib/displayScale.js';
import { decodeTeam } from './lib/share.js';
import { FILM_STRIPS } from './lib/filmStrips.js';
import { loadState, saveState } from './lib/storage.js';
import { initialState, loadoutOf, teamsReducer } from './lib/teamsReducer.js';
import Analysis from './components/Analysis.jsx';
import LoadoutPanel from './components/LoadoutPanel.jsx';
import Mascot from './components/Mascot.jsx';
import Portrait from './components/Portrait.jsx';
import Roster from './components/Roster.jsx';
import PickerSheet from './components/PickerSheet.jsx';
import SharePanel from './components/SharePanel.jsx';
import SocialLinks from './components/SocialLinks.jsx';
import TeamSlots from './components/TeamSlots.jsx';
import TeamTabs from './components/TeamTabs.jsx';

// The team builder loads first; every other page (and the export dialog) is
// fetched only when it's opened, so the first visit downloads much less.
const AgentsPage = lazy(() => import('./components/AgentsPage.jsx'));
const BangbooPage = lazy(() => import('./components/BangbooPage.jsx'));
const DriveDiscsPage = lazy(() => import('./components/DriveDiscsPage.jsx'));
const EtherealsPage = lazy(() => import('./components/EtherealsPage.jsx'));
const ExportDialog = lazy(() => import('./components/ExportDialog.jsx'));
const GlossaryPage = lazy(() => import('./components/GlossaryPage.jsx'));
const WEnginesPage = lazy(() => import('./components/WEnginesPage.jsx'));

/** Shown for a moment while a page's code downloads. */
function PageLoading() {
  return (
    <p className="page-loading muted" role="status">
      Loading…
    </p>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(teamsReducer, null, () => initialState(loadState()));
  const route = useHashRoute();
  const display = useDisplayScale();
  // Re-render everything (synergy checks, W-Engine lists) when beta info is shown or hidden.
  useShowBeta();
  const active = state.teams.find((t) => t.id === state.activeId);

  // Which squad slot's loadout is open. Closes when switching teams.
  const [selectedSlot, setSelectedSlot] = useState(null);
  // Phone picker sheet: which empty slot is being filled (null when closed).
  const [pickSlot, setPickSlot] = useState(null);
  const pickEmpty = (index) => {
    // Wide screens already show the Agents list beside the squad: just jump to its search.
    if (window.matchMedia('(min-width: 960px)').matches) {
      document.getElementById('roster-search')?.focus();
      return;
    }
    setPickSlot(index);
  };
  useEffect(() => setSelectedSlot(null), [state.activeId]);
  const [exporting, setExporting] = useState(false);
  // Leaving the team builder closes its export dialog.
  useEffect(() => {
    if (route.view !== 'builder') setExporting(false);
  }, [route.view]);
  const selectedAgent = selectedSlot != null ? AGENT_BY_ID[active.members[selectedSlot]] : null;

  // Each member's gear, for the synergy score's Gear part.
  const loadouts = useMemo(
    () => Object.fromEntries(active.members.filter(Boolean).map((id) => [id, loadoutOf(active, id)])),
    [active],
  );
  const analysis = useMemo(() => analyzeTeam(active.members, active.bangboo), [active.members, active.bangboo]);
  const usage = useMemo(() => usageInOtherTeams(state.teams, state.activeId), [state.teams, state.activeId]);

  useEffect(() => {
    saveState({ teams: state.teams, activeId: state.activeId });
  }, [state.teams, state.activeId]);

  // Opening a link ending in #zzz1~... adds that team.
  useEffect(() => {
    const team = decodeTeam(decodeURIComponent(window.location.hash));
    if (!team) return;
    dispatch({ type: 'import', ...team });
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch {
      /* ignore */
    }
  }, []);

  function addFromIndex(agentId) {
    dispatch({ type: 'toggle', agentId });
    navigate('builder');
  }

  return (
    <div className="app">
      <div className="backdrop" aria-hidden="true">
        {FILM_STRIPS.map(([k, o]) => (
          <span key={k} style={{ '--k': k, '--o': o }} />
        ))}
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
          <nav className="nav" aria-label="Sections">
            {VIEWS.map((v) => (
              <a
                key={v.id}
                href={`#${v.id}`}
                className="nav__link"
                aria-current={route.view === v.id ? 'page' : undefined}
              >
                {v.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="masthead__meta-row">
          <p className="masthead__meta">
            Unofficial fan project · Game data v{DATA_VERSION} · Not affiliated with HoYoverse
          </p>
          <label className="display-size">
            <span>Display size</span>
            <select id="display-size" value={display.setting} onChange={(e) => display.setSetting(e.target.value)}>
              {SCALE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id === 'auto' ? `Auto (${Math.round(display.scale * 100)}%)` : o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <Suspense fallback={<PageLoading />}>
        {route.view === 'agents' && (
          <AgentsPage
            agentId={route.agentId}
            activeTeam={active}
            onAdd={addFromIndex}
            onApplyBuild={(agentId, loadout) => {
              dispatch({ type: 'setLoadout', agentId, patch: loadout });
              dispatch({
                type: 'notice',
                text: `Equipped the recommended build on ${AGENT_BY_ID[agentId].name} in “${active.name}”.`,
              });
            }}
            onLoadTeam={(team) => {
              dispatch({ type: 'import', ...team });
              navigate('builder');
            }}
          />
        )}
        {route.view === 'w-engines' && <WEnginesPage specialty={route.specialty} wEngineId={route.wEngineId} />}
        {route.view === 'drive-discs' && <DriveDiscsPage discId={route.discId} />}
        {route.view === 'bangboo' && (
          <BangbooPage
            bangbooId={route.bangbooId}
            activeTeam={active}
            onPick={(id) => dispatch({ type: 'setBangboo', id })}
          />
        )}
        {route.view === 'ethereals' && (
          <EtherealsPage
            onLoadTeam={(team) => {
              dispatch({ type: 'import', ...team });
              navigate('builder');
            }}
          />
        )}
        {route.view === 'glossary' && <GlossaryPage />}
      </Suspense>

      {route.view === 'builder' && (
        <main className="layout">
          <div className="bench">
            <TeamTabs
              teams={state.teams}
              activeId={state.activeId}
              dispatch={dispatch}
              onExport={() => setExporting(true)}
            />

            {state.isExample && (
              <p className="banner">
                These two example teams are community archetypes. Edit them or add your own with “New team”.
              </p>
            )}

            <TeamSlots
              team={active}
              selected={selectedAgent ? selectedSlot : null}
              onSelect={setSelectedSlot}
              dispatch={dispatch}
              onPickEmpty={pickEmpty}
            />

            {selectedAgent ? (
              <LoadoutPanel
                key={selectedAgent.id}
                agent={selectedAgent}
                loadout={loadoutOf(active, selectedAgent.id)}
                onChange={(patch) => dispatch({ type: 'setLoadout', agentId: selectedAgent.id, patch })}
                onClose={() => setSelectedSlot(null)}
              />
            ) : (
              active.members.some(Boolean) && (
                <p className="hint">Select a squad member to equip a W-Engine, Drive Discs and main stats.</p>
              )
            )}

            <p className="notice" role="status" aria-live="polite">
              {state.notice}
            </p>

            <Analysis analysis={analysis} bangboo={active.bangboo} loadouts={loadouts} />
            <SharePanel team={active} dispatch={dispatch} />
          </div>

          <div className="side">
            <div className="mini" aria-hidden="true">
              <span className="mini__name">{active.name}</span>
              <span className="mini__slots">
                {active.members.map((id, i) =>
                  id ? (
                    <Portrait key={i} agent={AGENT_BY_ID[id]} size="sm" />
                  ) : (
                    <span key={i} className="mini__empty" />
                  ),
                )}
              </span>
              <span className="mini__count">{active.members.filter(Boolean).length}/3</span>
            </div>
            <Roster members={active.members} usage={usage} dispatch={dispatch} />
          </div>
        </main>
      )}

      {exporting && (
        <Suspense fallback={null}>
          <ExportDialog team={active} onClose={() => setExporting(false)} />
        </Suspense>
      )}
      {pickSlot != null && (
        <PickerSheet onClose={() => setPickSlot(null)}>
          <Roster
            sheet
            slot={pickSlot}
            members={active.members}
            usage={usage}
            dispatch={dispatch}
            onPick={() => setPickSlot(null)}
          />
        </PickerSheet>
      )}

      <footer className="foot">
        <SocialLinks />
        <p className="foot__notes">
          Your teams are saved only in this browser on this device. Nobody else can see or change them. Game data is
          compiled from community sources and may lag behind patches; only released and officially announced content is
          included. Zenless Zone Zero and all related content belong to HoYoverse.
        </p>
      </footer>
    </div>
  );
}
