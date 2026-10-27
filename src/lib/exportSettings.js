// Options shared by every exported image (team images, Agent cards and
// endgame cards). Kept apart from the drawing code so the export dialog can
// show its choices straight away, while the heavier canvas code in
// teamCard.js, agentCards.js and endgameCards.js loads only when an image is
// actually made.

/** Team image layouts: three gear columns, the squad screen, or a square post. */
export const TEAM_LAYOUTS = [
  { id: 'columns', label: 'Columns', hint: '16:9' },
  { id: 'squad', label: 'Squad', hint: '16:9 · big art' },
  { id: 'square', label: 'Square', hint: '1:1' },
];

/** Agent card types on an Agent's page. */
export const AGENT_CARDS = [
  { id: 'build', label: 'Build', hint: '16:9' },
  { id: 'farm', label: 'Farming', hint: '16:9' },
  { id: 'guide', label: 'Guide', hint: '4:5' },
];
/** Only offered once the reader has saved their own build for the Agent. */
export const MY_BUILD_CARD = { id: 'mine', label: 'My build', hint: '16:9' };

/** Default pixel scale for exports (HD). */
export const EXPORT_SCALE = 2;
/** Export sizes: the same layout at 1×, 2× or 3× the pixels. */
export const EXPORT_SIZES = [
  { id: 1, label: 'Standard', hint: 'Small file, quick to send' },
  { id: 2, label: 'HD', hint: 'Sharp on phones and when zoomed' },
  { id: 3, label: 'Max', hint: 'For printing or big screens' },
];

/** A finished canvas as a PNG file, for saving, copying or sharing. */
export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}
