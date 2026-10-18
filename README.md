# ZZZ Team Builder

An unofficial, fan-made team planner for **Zenless Zone Zero (ZZZ)**.

Plan squads, gear up Agents, browse W-Engines, Drive Discs and Bangboo, and share teams with a short code. Works in any modern browser on desktop and mobile, with no account or installation.

> ZZZ Team Builder is not affiliated with, endorsed by, or sponsored by HoYoverse. See [Legal](#legal).

## Features

- **Multiple saved teams.** Create, rename, duplicate and delete as many squads as you need. Agents already used in another team are flagged.
- **Squads of three plus a Bangboo**, picked from a roster you can filter by attribute, specialty, rank and faction. Each roster card shows whether the Agent would share an attribute or faction with the current squad.
- **Loadouts.** Give each Agent a W-Engine (their specialty first, signature marked) with its Phase, a Mindscape level, a 4-piece and 2-piece Drive Disc set, and the main stats for slots 4 to 6. Loadouts are saved per team.
- **Synergy check.** Specialty coverage, shared attributes and factions, and notes on Stun, damage dealers and Disorder.
- **Sharing.** Every team has a code and a link that rebuild the squad, Bangboo and gear. Load community presets as a starting point.
- **Team images.** Export a 1200×675 card to save, copy or share from a phone.
- **Agents, W-Engines, Drive Discs and Bangboo pages** with filters, sorting, grid and list views, and detail views.
- **Glossary** of game terms.
- **Display size** that scales on large screens, with a manual picker saved per browser.
- **Light and dark themes**, following your system setting.

## Running locally

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev        # development server
npm run build      # production build in dist/
```

Use `npm run dev -- --host` to open the development server from a phone on the same network.

## Deployment

Every push to `main` is built and published to GitHub Pages by `.github/workflows/deploy.yml`.

## Project structure

```
src/
  data/          game data: Agents, W-Engines, Drive Discs, Bangboo, presets, glossary
  lib/           team analysis, state, routing, share codes, team image, storage
  components/    React UI components
  App.jsx        application shell
  styles.css     styles and theme tokens
public/
  agents/        Agent portraits (official art, see NOTICE.md)
  bangboo/       Bangboo art (official art, see NOTICE.md)
```

Game data lives in `src/data` and game rules in `src/lib`, independent of the UI. Game data is compiled from the community wiki (see NOTICE.md) and covers released content plus officially announced Agents only.

## Privacy

The app has no backend, accounts, analytics or tracking. Anything you save stays in your browser's local storage and never leaves your device unless you share it yourself. Fonts are served by Google Fonts.

## Legal

**Unofficial fan project.** ZZZ Team Builder is a free, non-commercial fan project. It is not affiliated with, endorsed by, or sponsored by HoYoverse, miHoYo, COGNOSPHERE or any of their affiliates.

**Trademarks and game content.** *Zenless Zone Zero*, *ZZZ*, and all related names, characters, artwork and other game content are trademarks or copyrighted material of their respective owners. They are referenced here for identification and informational purposes only, and all rights remain with their owners.

**Artwork.** Cortado, the site mascot, is original artwork licensed separately under [CC BY-NC-ND 4.0](LICENSE-ARTWORK.md): share him unchanged with credit, but don't edit him, remove his watermark or use him commercially. Any official artwork added to the project is used only where its publisher allows it for fan use, under that publisher's terms, and is not covered by this repository's license.

**No monetisation.** The project carries no advertising, paid features or donations and will not be monetised.

**Removal requests.** Rights holders who would like any content changed or removed can [open an issue](https://github.com/SilverneoStar/zzz-team-builder/issues). Requests will be handled promptly.

See [NOTICE.md](NOTICE.md) for full attribution.

## License

The source code is released under the [MIT License](LICENSE). The license covers this project's original code only; it grants no rights to third-party game content, trademarks or artwork.

Cortado, the site mascot, and all Cortado stickers and images are licensed under [CC BY-NC-ND 4.0](LICENSE-ARTWORK.md), not the MIT License.
