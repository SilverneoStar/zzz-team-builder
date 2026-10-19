# ZZZ Team Builder

An unofficial, fan-made team planner for **Zenless Zone Zero (ZZZ)**.

Plan squads, gear up Agents, browse W-Engines, Drive Discs and Bangboo, and share teams with a short code. Works in any modern browser on desktop and mobile, with no account or installation.

> ZZZ Team Builder is not affiliated with, endorsed by, or sponsored by HoYoverse. See [Legal](#legal).

## Features

- **Multiple saved teams.** Create, rename, duplicate and delete as many squads as you need. Agents already used in another team are flagged.
- **Squads of three plus a Bangboo**, picked from a roster you can filter by attribute, specialty, rank and faction. Each roster card shows whether the Agent would share an attribute or faction with the current squad.
- **Loadouts.** Tap an Agent to open their equipment wheel, like in game: the W-Engine (their specialty first, signature marked) with its Phase in the middle, and the six Drive Disc slots around it, each with its own set, rank and main stat. Set bonuses (2-piece and 4-piece) are worked out from the equipped discs, and quick fill sets four or two slots at once. Mindscape level too, and Potential level for Agents with Potential Vision. Loadouts are saved per team.
- **Skills.** Each Agent page has a Skills tab: every skill in short, the Core Passive at each level (Base, A–F), the Additional Ability and whether your current team turns it on, Mindscapes, and Potential where the Agent has one.
- **Materials.** Each Agent page lists what to farm to reach level 60, max all skills and finish the Core Skill, with where each item drops and which other Agents farm the same bosses.
- **Synergy check.** Additional Abilities (which are on), kit links such as Ether Veil and Aftershock, specialty coverage, shared attributes and factions, and notes on Stun, damage dealers and Disorder. Each Agent page lists good fits: who turns on their Additional Ability, who it works both ways with, and kit links.
- **Sharing.** Every team has a code and a link that rebuild the squad, Bangboo and gear. Load community presets as a starting point.
- **Team images.** Export a 1200×675 card to save, copy or share from a phone.
- **Builds and best teams.** Each released Agent's page has a Build tab (W-Engines in order, 4-piece and 2-piece Drive Disc sets, main stats and substats) and a Best teams tab. Equip the build on the Agent in your current team, or load a best team with everyone's recommended gear.
- **Bangboo details.** Each Bangboo's Active Skill, Additional Ability (with whether your current team turns it on, and its values at levels 1–5), Chain Attack, and the Agents it's recommended for.
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
  w-engines/     W-Engine icons (official art, see NOTICE.md)
```

Game data lives in `src/data` and game rules in `src/lib`, independent of the UI. Game data is compiled from the sources listed under [Sources](#sources) and covers released content plus officially announced Agents only.

## Sources

All game information is factual data about released content (plus officially announced Agents). No game files are extracted, and beta or leaked data is never used. Write-ups from guides are not copied; only names, numbers and game facts are taken, and the skill summaries are written in this project's own words.

| What | Source |
| --- | --- |
| Agents, W-Engines, Drive Discs and Bangboo: names, ranks, attributes, specialties, factions, stats, set bonuses, release versions | [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/) (Fandom), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Additional Ability conditions and kit links (Ether Veil, Aftershock) | [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/), CC BY-SA 4.0 |
| Skills tab: skills, Core Passive values (Base, A–F), Additional Abilities, Mindscapes and Potential, summarised | [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/), CC BY-SA 4.0 |
| Bangboo skills: Active Skill, Additional Ability (team condition and values) and Chain Attack, summarised | [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/), CC BY-SA 4.0 |
| Materials tab: level-up, skill and Core Skill costs and where each item drops | [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/), CC BY-SA 4.0 |
| Build and Best teams tabs: W-Engine, Drive Disc, stat and team picks | [Icy Veins](https://www.icy-veins.com/zenless-zone-zero/) build and team guides |
| Agent roles and in-combat stat targets | Community [ZZZ Agent Build Guide](https://docs.google.com/spreadsheets/d/e/2PACX-1vTj2PaPq6Py_1B5fsOPj_Moc-tN_7mut7fICczI6lz1njyEIAInTnfB7lAraX4pYCRGNbaHGlIbFZ90/pubhtml) (Google Sheets) |
| Upcoming Agents (teams, expected style) | HoYoverse's official reveals and livestreams; estimates are marked on the site |
| Agent portraits, Bangboo art, W-Engine icons, attribute and specialty icons | Official game art © HoYoverse |

Data was last compiled in October 2026 and may lag behind new patches. Corrections are welcome through [issues](https://github.com/SilverneoStar/zzz-team-builder/issues). See [NOTICE.md](NOTICE.md) for full attribution.

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
