import { useSyncExternalStore } from 'react';

// Whether the reader wants to see beta information (kits, builds and names of
// upcoming Agents taken from beta data). Shown by default; the choice is
// remembered on this device and shared by every page.
const KEY = 'zzz-team-builder:showBeta';
const listeners = new Set();

let show = (() => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
})();

export const showBeta = () => show;

export function setShowBeta(v) {
  show = Boolean(v);
  try {
    localStorage.setItem(KEY, show ? 'on' : 'off');
  } catch {
    /* storage unavailable: the choice lasts until the page closes */
  }
  listeners.forEach((fn) => fn());
}

const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useShowBeta = () => useSyncExternalStore(subscribe, showBeta, showBeta);
