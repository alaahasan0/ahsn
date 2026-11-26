# BENA — Voiceover Script (English)

**Film:** BENA cinematic product launch film · 90 seconds · vertical 9:16
**Narrator direction:** natural, warm, refined, calm and confident. Moderate pace, natural pauses, a premium technology presentation, never trailer-style or salesy.
**Pronunciation:** BENA = **BEH-nah** /ˈbɛnə/ (rhymes with "henna").

## Recording used in the film

The narration in the current cut was generated with an ElevenLabs v4 voice through the connected Magnific account. The voice is the catalogue narrator "Cedric Beck Becker", described as a mature North American voice with measured, understated delivery. It is synthetic, not a human recording. To swap in a human narrator, record the ten lines below as separate files with the same names (`public/voiceover/vo01.mp3` … `vo10.mp3`) and run `node scripts/mix-audio.cjs`. If a new take is longer or shorter, adjust its `at` value in `src/data/timeline.json`.

| # | Starts at | Max length | Scene | Line |
|---|---|---|---|---|
| 01 | 00:00.9 | 7.3 s | Every building has a story | Every building has a story… A place where people live, work, connect, and build their lives. |
| 02 | 00:08.5 | 7.5 s | Introducing BENA | Meet BENA. A connected building ecosystem, designed to bring buildings, people, and services together. |
| 03 | 00:16.6 | 9.6 s | A digital identity | At its core, BENA gives every building a digital identity, creating a foundation for better information, coordination, and connected services. |
| 04 | 00:26.6 | 8.1 s | Connected to cities | Designed to connect with municipal building information, BENA creates a foundation for a more organized and connected urban environment. |
| 05 | 00:35.1 | 9.2 s | Many experiences | Owners, residents, committees, and property managers can each access the experience that matters to them, all connected through the same building. |
| 06 | 00:44.6 | 9.9 s | Management | From property operations and occupancy, to maintenance, assets, and everyday building management, BENA brings essential information into one connected experience. |
| 07 | 00:54.8 | 9.4 s | Services within reach | Need a service? Looking for a property? BENA creates a connected ecosystem, where services and property opportunities become easier to discover. |
| 08 | 01:04.5 | 9.4 s | One ecosystem | More than an application, BENA is a vision for a connected built environment, where information, people, and services work better together. |
| 09 | 01:14.2 | 8.4 s | A connected future | Starting with the identity of each building, BENA opens the door to a smarter, more connected future… for the places we share. |
| 10 | 01:23.6 | 5.5 s | Final reveal | BENA. *(one-second pause)* Buildings. People. Services… Connected. |

"Max length" is the space available before the next line starts. A take may be a little shorter; avoid going longer.

## Recording guide for a human narrator

- **Setup:** a treated room or vocal booth, a large-diaphragm condenser about 20 cm away with a pop filter, 48 kHz / 24-bit WAV, peaks around −6 dBFS. Leave about one second of room tone before and after each line.
- **Performance:**
  - Speak to one person, not an audience.
  - Let the commas breathe.
  - Lift slightly on "Meet BENA" and "Connected", but keep it understated.
  - Leave a real pause after "BENA." in line 10.
- **Takes:** three per line, one file per line, file names `vo01`–`vo10`.
- **Processing:** light only. A high-pass at 70 Hz and gentle compression are applied in the mix script. Avoid heavy limiting or de-essing.

## Full read (continuous)

> Every building has a story. A place where people live, work, connect, and build their lives.
> Meet BENA. A connected building ecosystem, designed to bring buildings, people, and services together.
> At its core, BENA gives every building a digital identity, creating a foundation for better information, coordination, and connected services.
> Designed to connect with municipal building information, BENA creates a foundation for a more organized and connected urban environment.
> Owners, residents, committees, and property managers can each access the experience that matters to them, all connected through the same building.
> From property operations and occupancy, to maintenance, assets, and everyday building management, BENA brings essential information into one connected experience.
> Need a service? Looking for a property? BENA creates a connected ecosystem, where services and property opportunities become easier to discover.
> More than an application, BENA is a vision for a connected built environment, where information, people, and services work better together.
> Starting with the identity of each building, BENA opens the door to a smarter, more connected future, for the places we share.
> BENA. Buildings. People. Services. Connected.
