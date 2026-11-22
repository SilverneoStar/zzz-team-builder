// The player's own UID (and in-game name), kept in this browser only, so the
// showcase import can fill it in and "Update my builds" is one tap. Looking up
// someone else's UID never changes it.
const KEY = 'zzz-team-builder:uid';
const NAME = 'zzz-team-builder:uidName';

export function getMyUid() {
  try {
    return { uid: localStorage.getItem(KEY) ?? '', name: localStorage.getItem(NAME) ?? '' };
  } catch {
    return { uid: '', name: '' };
  }
}

export function saveMyUid(uid, name = '') {
  try {
    localStorage.setItem(KEY, uid);
    if (name) localStorage.setItem(NAME, name);
    else localStorage.removeItem(NAME);
    return true;
  } catch {
    return false;
  }
}

export function forgetMyUid() {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(NAME);
  } catch {
    /* nothing kept anyway */
  }
}
