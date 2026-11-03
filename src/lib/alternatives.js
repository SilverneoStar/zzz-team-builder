// Alternatives for an Agent's W-Engine and Drive Discs, for the Agent cards.
// W-Engines are sorted by how easy they are to get:
//   signature   the Agent's own W-Engine
//   similar     another limited S-Rank from the recommended list
//   standard    an S-Rank from the standard channel (also sold in the Residual Signal shop)
//   a-rank      an A-Rank from the list, the free-to-play pick
// Picks come from the Agent's recommended list first. When the list has no
// standard or A-Rank pick, a general one for the specialty fills in (one with
// no attribute condition, or a matching one), so every card can show a
// budget option.
import { BUILDS } from '../data/builds.js';
import { AGENT_BY_ID, STANDARD_S_RANKS, W_ENGINE_BY_ID, W_ENGINES, signatureOf } from '../data/game.js';

// General picks by specialty: standard S-Ranks, then A-Ranks anyone of that specialty can use.
const GENERAL_STANDARD = {
  attack: ['the-brimstone', 'steel-cushion'],
  stun: ['hellfire-gears', 'the-restrained'],
  anomaly: ['fusion-compiler'],
  support: ['weeping-cradle'],
};
const GENERAL_A = {
  attack: ['cannon-rotor', 'marcato-desire'],
  stun: ['steam-oven'],
  anomaly: ['weeping-gemini'],
  support: ['slice-of-time'],
};

/** S-Rank W-Engines from the standard channel: the standard S-Rank Agents' signatures. */
export const STANDARD_W_ENGINES = new Set(
  W_ENGINES.filter((w) => w.rank === 'S' && STANDARD_S_RANKS.has(w.signatureOf)).map((w) => w.id),
);

export const ENGINE_TAG = {
  signature: 'Signature',
  similar: 'Similar',
  standard: 'Standard · shop',
  'a-rank': 'A-Rank · F2P',
};

/** [{ id, kind }] in order signature → similar → standard → A-Rank (each once, when there is one). */
export function engineOptions(agentId) {
  const list = (BUILDS[agentId]?.wEngines ?? []).filter((id) => W_ENGINE_BY_ID[id]);
  const sig = signatureOf(agentId);
  const sigId = sig && !sig.beta && !sig.nameTbd ? sig.id : list.find((id) => W_ENGINE_BY_ID[id].signatureOf === agentId);
  const rest = list.filter((id) => id !== sigId);
  const s = (id) => W_ENGINE_BY_ID[id].rank === 'S';
  const out = [];
  if (sigId) out.push({ id: sigId, kind: 'signature' });
  const similar = rest.find((id) => s(id) && !STANDARD_W_ENGINES.has(id));
  if (similar) out.push({ id: similar, kind: 'similar' });
  const agent = AGENT_BY_ID[agentId];
  const fits = (id) => {
    const w = W_ENGINE_BY_ID[id];
    return w && !out.some((o) => o.id === id) && (!w.attributes || w.attributes.includes(agent?.attribute));
  };
  const standard =
    rest.find((id) => s(id) && STANDARD_W_ENGINES.has(id)) ?? (GENERAL_STANDARD[agent?.specialty] ?? []).find(fits);
  if (standard) out.push({ id: standard, kind: 'standard' });
  // An A-Rank signature already is the free-to-play pick.
  const sigIsA = sigId && W_ENGINE_BY_ID[sigId].rank === 'A';
  const aRank = rest.find((id) => W_ENGINE_BY_ID[id].rank === 'A') ?? (sigIsA ? null : (GENERAL_A[agent?.specialty] ?? []).find(fits));
  if (aRank) out.push({ id: aRank, kind: 'a-rank' });
  return out;
}

/** Recommended Drive Disc sets as { four, two }, leaving out `skip` (sets already worn). */
export function discOptions(agentId, skip = []) {
  const b = BUILDS[agentId];
  if (!b) return { four: [], two: [] };
  const no = new Set(skip);
  return {
    four: b.fourPiece.filter((id) => !no.has(id)),
    two: b.twoPiece.filter((id) => !no.has(id) && !b.fourPiece.slice(0, 1).includes(id)),
  };
}
