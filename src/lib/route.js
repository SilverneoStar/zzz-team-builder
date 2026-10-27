import { startTransition, useEffect, useState } from 'react';

// Tiny hash router: #builder, #agents, #agent-<id>, #w-engines,
// #w-engines-<specialty>, #w-engine-<id>, #drive-discs, #drive-disc-<id>,
// #bangboo, #ethereals, #glossary. Hashes stay plain tokens so links work wherever the
// app is hosted.
export const VIEWS = [
  { id: 'builder', label: 'Team Builder' },
  { id: 'agents', label: 'Agents' },
  { id: 'w-engines', label: 'W-Engines' },
  { id: 'drive-discs', label: 'Drive Discs' },
  { id: 'bangboo', label: 'Bangboo' },
  { id: 'ethereals', label: 'Ethereals' },
  { id: 'glossary', label: 'Glossary' },
];

export function parseHash(hash) {
  const h = (hash || '').replace(/^#/, '');
  if (h.startsWith('agent-')) return { view: 'agents', agentId: h.slice(6) };
  if (h.startsWith('w-engines-')) return { view: 'w-engines', specialty: h.slice(10) };
  if (h.startsWith('w-engine-')) return { view: 'w-engines', wEngineId: h.slice(9) };
  if (h.startsWith('drive-disc-')) return { view: 'drive-discs', discId: h.slice(11) };
  if (h.startsWith('bangboo-')) return { view: 'bangboo', bangbooId: h.slice(8) };
  if (VIEWS.some((v) => v.id === h)) return { view: h };
  return { view: 'builder' };
}

export function navigate(target) {
  if (window.location.hash !== `#${target}`) window.location.hash = target;
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      // A transition keeps the current page on screen while the next one's
      // code downloads, instead of flashing a "Loading…" placeholder.
      startTransition(() => setRoute(parseHash(window.location.hash)));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
