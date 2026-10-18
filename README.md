# ZZZ Team Builder

An unofficial, fan-made team planner for **Zenless Zone Zero (ZZZ)**.

Plan squads, browse Agents, W-Engines, Drive Discs and Bangboo, and share teams with a short code. Works in any modern browser on desktop and mobile, with no account or installation.

> ZZZ Team Builder is not affiliated with, endorsed by, or sponsored by HoYoverse. See [Legal](#legal).

**Status:** in development. The live site currently shows a preview page while the builder is put together.

## Planned features

- **Agents.** Browse every Agent by attribute, specialty, faction and rank, with skills and recommended builds.
- **W-Engines.** Signature and alternative W-Engines for each Agent.
- **Drive Discs.** Set bonuses and main and sub stat planning for every slot.
- **Bangboo.** Which Bangboo suit a squad and what they bring to it.
- **Saved teams.** Build and save multiple squads, check their synergy and share them with a short code.
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
  components/    React UI components
  App.jsx        application shell
  styles.css     styles and theme tokens
public/          site icons and the Cortado mascot
```

Game data will live in `src/data` and game rules in `src/lib`, independent of the UI.

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
