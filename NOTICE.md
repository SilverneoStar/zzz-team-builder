# Notice and attribution

## Relationship to the game

ZZZ Team Builder is an unofficial, non-commercial fan project. It is not affiliated with, endorsed by, or sponsored by HoYoverse, miHoYo, COGNOSPHERE or their affiliates.

*Zenless Zone Zero*, *ZZZ*, and all associated names, characters, logos, artwork and game data are the property of their respective owners. They appear in this project solely to identify the game and its characters for informational purposes.

## Game data

Agent, W-Engine, Drive Disc and Bangboo names, ranks, attributes, specialties, factions, stats, set bonuses, release versions, Additional Ability names and conditions, and kit links (Ether Veil and Aftershock) in `src/data/` are factual game information compiled from the community [Zenless Zone Zero Wiki](https://zenless-zone-zero.fandom.com/) on Fandom (October 2026), whose text is available under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Details of upcoming Agents (such as Phoenix's Additional Ability condition and recommended teams) come only from HoYoverse's official reveals and livestreams, apart from Phoenix's Core Passive, Mindscapes and build guidance, which are short rewordings of pre-release information marked "Subject to change" on the site; Severian's condition and the Roxy team are estimates from the 3.3 livestream gameplay and are marked as such on the site until his official reveal; his Drive Discs and build notes come from his official 3.3 in-game trial. Phoenix and her W-Engine Plume of Rebirth released in 3.3. Sunbringer (Eldreda, Lindverne and Dracaene Sunbringer, an S-rank Fire Armorer of Roscaelifer, listed for 3.4) comes only from HoYoverse's official drip marketing; her portraits (one per member) are cropped from that official art, the Roscaelifer "RSC" mark and her members' department logos (Administrative Affairs and Central Computing, the latter recoloured to the gold of the official reveal) are taken from HoYoverse's "Five Central Departments" posts, and the "From a mother to her children" verses on her exported cards are quoted from the same reveal, and her kit, build and Core Skill drops are left blank until they're revealed. Skill summaries in `src/data/skills/` (skills, Core Passive values by level, Additional Abilities, Mindscapes and Potential) are shortened rewordings of the same Wiki's skill text, with the game's numbers kept, and are shared under the same CC BY-SA 4.0 licence. Bangboo skill summaries (`src/data/bangbooSkills.js`) are shortened the same way. Level-up, skill and Core Skill material costs and where they drop (`src/data/materials.js`) come from the same Wiki. W-Engine, Bangboo EXP and Drive Disc levelling costs (`src/data/levelMats.js`) come from Icy Veins' Zenless Zone Zero leveling guide and W-Engine pages (October 2026). The order to level each Agent's skills (`src/data/skillPriority.js`) follows the upgrade order listed on ZZZ Build's Agent pages (zzz-build.com, October 2026). Only released content and officially announced Agents are included, with occasional clearly-marked test-server figures for upcoming content, ahead of their live release; undocumented leaks are never used. No game files are extracted, decompiled or redistributed.

Recommended builds and best teams on the Agent pages (`src/data/builds.js`) are community picks compiled from [Icy Veins](https://www.icy-veins.com/zenless-zone-zero/)' Zenless Zone Zero build and team guides (October 2026): only the names of W-Engines, Drive Disc sets, stats and Agents are used, not their write-ups. They are recommendations, not official HoYoverse data, and change with new Agents and patches.

Agent roles and stat targets on the Build tab (`src/data/statTargets.js`) come from the community [ZZZ Agent Build Guide](https://docs.google.com/spreadsheets/d/e/2PACX-1vTj2PaPq6Py_1B5fsOPj_Moc-tN_7mut7fICczI6lz1njyEIAInTnfB7lAraX4pYCRGNbaHGlIbFZ90/pubhtml) on Google Sheets; each entry notes the game version it was last updated for.

## Artwork

| Content | Source | Terms |
| --- | --- | --- |
| Agent portraits in `public/agents/`, Bangboo art in `public/bangboo/`, W-Engine icons in `public/w-engines/`, attribute icons in `public/attributes/`, specialty icons in `public/specialties/` and skill-type icons in `public/skills/`, Drive Disc art in `public/discs/`, item icons in `public/materials/` and faction logos in `public/factions/` (cropped to size and cleaned up for display, otherwise unchanged) | Official game art by HoYoverse | © HoYoverse; publisher's terms apply; not covered by this repository's license |
| Eous sticker on the Urban record player (`public/stickers/eous.webp`, with a white sticker edge added) | Official "En-Nah Stroll" Sticker Pack 1 by HoYoverse (hoyo.link/8QBlFEAL) | © HoYoverse; publisher's terms apply; not covered by this repository's license |
| Cortado, the site mascot (all four headwear versions and its emotes, including the "Chill" sticker in `public/stickers/cortado-chill.webp`), and site icons (`public/mascot*.svg`, `public/favicon.ico`, `public/icon-*.png`, `public/apple-touch-icon.png`, `src/components/Mascot.jsx`) | Original artwork by SilverneoStar (SilverStarneo-Cortado) | [CC BY-NC-ND 4.0](LICENSE-ARTWORK.md); not covered by the MIT License |
| Leaf sticker on the Wood & copper record player (`public/stickers/leaf.webp`) | Drawn for this site | Covered by this repository's license |

Official artwork is used only for this free, non-commercial fan project, within the publisher's terms, and will be removed on request.

## Third-party software

- [React](https://react.dev): MIT License
- [Vite](https://vitejs.dev): MIT License
- Fonts via [Google Fonts](https://fonts.google.com): Big Shoulders Display, IBM Plex Sans and IBM Plex Mono, under the SIL Open Font License 1.1

## Contact

Rights holders may request changes or removal of any content by [opening an issue](https://github.com/SilverneoStar/zzz-team-builder/issues).


W-Engine passive effects are short summaries, written in our own words, of each W-Engine's in-game passive at Phase 1. Incarcerating Grip has none yet because it is not released.
