# Research: Ink narrative event emission patterns

- **Slug:** `2026-05-18-ink-narrative-event-patterns`
- **Date:** 2026-05-18
- **Status:** complete
- **Triggered by:** Task #6 (Persona + PersonaDirector) — after the Project Ares review surfaced that the persona's episodic memory should record narrative *consequences* of each choice (audio cues, UI shifts, variable changes) rather than just the choice itself, the question "how do shipping Ink projects actually surface those consequences?" needed a real answer rather than a guess.
- **Informed:** Design of poltergink's `NarrativeEvent` surface (pending) — the typed event stream that consumers like Project Ares' SvelteKit UI subscribe to. Indirectly: the shape of `EpisodicMemory` in the upcoming Persona work, since memory needs to capture event chains, not just decisions.

## Question

How do teams that actually ship Ink-based games and tools surface structured events from the Ink runtime to their host application? Specifically: what does Inkle (the company that made Ink) recommend; what mechanisms do shipping projects use in practice; what tradeoffs do experienced authors complain about; and what minimum set of primitives should a runtime wrapper like poltergink expose so consumers can build their own conventions without poltergink dictating syntax?

## Sources

### [Writing With Ink (official Inkle documentation)](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)

- **Authors / Org:** Inkle Studios
- **Type:** vendor documentation
- **Published:** ongoing (canonical reference, updated alongside Ink releases)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The authoritative statement of Inkle's design philosophy — that Ink intentionally provides three separate primitives (tags, external functions, variable observers) rather than one unified event API, and that authors pick per-need. This is the load-bearing source for the conclusion that poltergink should not ship a monolithic `NarrativeEvent` type with prescribed categories.
- **Quoted:**
  > "ink provides a simple system for tagging lines of content, with hashtags... [tags] can be read off by the game and used as you see fit."

### [Running Your Ink (Inkle integration guide)](https://github.com/inkle/ink/blob/master/Documentation/RunningYourInk.md)

- **Authors / Org:** Inkle Studios
- **Type:** vendor documentation
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Detailed patterns for consuming each of the three primitives in a host application, plus the explicit guidance that pure functions are `lookaheadSafe: true` and side-effecting ones must be `lookaheadSafe: false`. This documents a hazard poltergink will need to surface clearly when it exposes external-function binding: Ink's runtime evaluates lookahead branches, and a side-effecting external function called during lookahead will fire multiple times. The phrase "Parse text directly for flexible, project-specific instructions" is the closest thing Inkle says to endorsing a text-prefix DSL — and it's a single offhand sentence among hundreds, not a recommended path.
- **Quoted:**
  > "There are two core ways to provide game hooks in the ink engine. External function declarations in ink allow you to directly call C# functions in the game, and variable observers are callbacks that are fired in the game when ink variables are modified."

### [Story.cs (ink-engine-runtime, C# reference implementation)](https://github.com/inkle/ink/blob/master/ink-engine-runtime/Story.cs)

- **Authors / Org:** Inkle Studios
- **Type:** open-source code (reference runtime)
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** The canonical API surface — `currentTags`, `variablesState`, `BindExternalFunction(name, fn, lookaheadSafe)`, `ObserveVariable(name, callback)`, plus lifecycle events like `onDidContinue` and `onMakeChoice`. inkjs mirrors this API in JavaScript, so poltergink can wrap any of these and have the wrap remain idiomatic.

### [inkjs (the JavaScript port)](https://github.com/y-lohse/inkjs)

- **Authors / Org:** Yannick Lohse and contributors
- **Type:** open-source library
- **Published:** ongoing (2.4.0 stable at time of research)
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Confirmed that `currentTags`, `variablesState`, `BindExternalFunction`, and `ObserveVariable` are available in JavaScript with the same semantics as the C# version. This is the surface poltergink has direct access to. inkjs's own README does not add convention guidance beyond pointing at the Inkle docs — it's a thin port.

### [Unofficial Ink Cookbook, Chapter 13 — JavaScript Story API](https://github.com/videlais/Unofficial-Ink-Cookbook/blob/master/Chapter13/index.md)

- **Authors / Org:** Daniel Cox (videlais) and contributors
- **Type:** community-authored tutorial
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** A working code pattern for consuming `currentTags` in JavaScript with the structured-tags convention — `tags.reduce((acc, t) => { const [k, v] = t.split(":"); acc[k] = v; return acc; }, {})`. This is the de-facto idiom for turning Ink's `["speaker:Bob", "emotion:sad"]` into `{speaker: "Bob", emotion: "sad"}`, and it's what poltergink's optional parser helper should produce.

### [Pixel Crushers Dialogue System for Unity — Ink integration](https://www.pixelcrushers.com/dialogue_system/manual2x/html/ink.html)

- **Authors / Org:** Pixel Crushers (commercial Unity asset publisher)
- **Type:** vendor doc for a commercial integration layer
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** Concrete production convention from a widely-used commercial integration: tags like `# Actor=Bob` to identify the speaker, external functions for ShowAlert and quest control, bidirectional variable sync between Ink and the game state. The `Actor=Name` shape (equals-sign, not colon) is one of several real conventions in shipping use — a useful example of how authors solve the same problem with different syntaxes.

### [Dink: A Dialogue Pipeline for Ink](https://wildwinter.medium.com/dink-a-dialogue-pipeline-for-ink-5020894752ee)

- **Authors / Org:** Ian Thomas (Narrative Designer at Wispfire)
- **Type:** engineering blog + open-source tool
- **Published:** Medium article date not extracted; tool is actively maintained
- **Accessed:** 2026-05-18
- **Relevance:** high
- **What this contributed:** The case for an alternative entire approach — pre-compile `.ink` into a structured JSON sidecar that extracts speaker, line IDs, and other metadata from screenplay-style formatting, then run the Ink runtime alongside that sidecar. This is a *consumer-side* solution to "Ink doesn't have rich metadata", not an in-runtime one. Relevant for poltergink because it shows that some teams find tag-based metadata insufficient and reach for compile-time extraction. Validates that poltergink shouldn't try to be a Dink — the right layer for that work is upstream of the runtime.

### [Integrating Ink with Unreal Engine 5: A Comprehensive Guide](https://medium.com/@Jamesroha/integrating-ink-with-unreal-engine-5-a-comprehensive-guide-be4fd0ec6a3e)

- **Authors / Org:** James Roha
- **Type:** engineering blog
- **Published:** Medium article (date not extracted; recent)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** A clean three-mechanism breakdown from a working game engineer: external functions for narrative-to-gameplay triggers, variable synchronization for state coupling, tags as line-level metadata (example: `#face_smile`). This is the same three-mechanism pattern Inkle's docs describe, observed independently in a real production setting. Confirms the docs aren't aspirational — shipping teams genuinely combine all three.

### [Using Ink for Conversations (Echodog Games dev blog)](https://www.echodoggames.com/blog/2019/09/19/using-ink-for-conversations/)

- **Authors / Org:** Echodog Games (developers of *Signs of the Sojourner*)
- **Type:** game-dev blog
- **Published:** 2019-09-19
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Evidence that shipping commercial games use Ink with knot/stitch taxonomy for event architecture, tags for speaker, and external functions for sound triggers. Notable because *Signs of the Sojourner* is an actual commercial title with a substantial narrative, not a hypothetical tutorial.

### [Localizing Ink with Unity](https://johnnemann.medium.com/localizing-ink-with-unity-42a4cf3590f3)

- **Authors / Org:** Johnnemann Nordhagen
- **Type:** engineering blog
- **Published:** Medium (date not extracted; pre-2024)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Real friction point: Ink doesn't natively let you tag *choices* the way you can tag lines. The workaround is to encode choice IDs into tags via author convention (`#Shaw_Chap1_Joy_Line2`). This validates that `Choice.tags` is real and needed — which poltergink already exposes — and that the *content* of those tags is consumer-authored convention, not an Ink-level construct.

### [Ink + React: Playing Your Game on the Web (Journocoders)](https://medium.com/journocoders/create-a-news-game-with-ink-react-and-redux-part-ii-playing-your-game-on-the-web-5216e33043df)

- **Authors / Org:** Ændra Rininsland
- **Type:** engineering blog
- **Published:** Medium (Journocoders publication)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Web-specific consumer pattern: Ink output → tag parsing via `.reduce()` → Redux dispatch → React props. This is structurally identical to what a SvelteKit consumer (Project Ares) would do, just with React in the middle. Confirms that the unidirectional "runtime emits, consumer parses, host renders" loop is the standard pattern, and poltergink doesn't need to invent it.

### [inkgd: Godot port of the Ink runtime](https://github.com/ephread/inkgd)

- **Authors / Org:** Frédéric Maquin (ephread) and contributors
- **Type:** open-source language port
- **Published:** ongoing
- **Accessed:** 2026-05-18
- **Relevance:** low
- **What this contributed:** Different host-language perspective — Godot's signal-based event model means inkgd exposes `prompt_choices` and `choice_made` as signals rather than direct API calls. Useful as a sanity check: the Ink primitives map cleanly to a wide variety of host idioms (signals, observables, callbacks, promises). poltergink's typed event subscription is just one more of those idioms.

### [External Functions discussion (ink GitHub issue #131)](https://github.com/inkle/ink/issues/131)

- **Authors / Org:** Ink GitHub community
- **Type:** issue/discussion thread
- **Published:** 2017 (with ongoing replies)
- **Accessed:** 2026-05-18
- **Relevance:** medium
- **What this contributed:** Community skepticism toward external functions as a primary event mechanism. Several commenters in this thread argue that tags are usually sufficient and that text parsing is a viable alternative for cases where neither tags nor external functions fit. Inkle's responses lean toward "use the simplest mechanism that works" rather than mandating external functions for game-side hooks. Reinforces that poltergink should make external functions available but not promote them as the default path.

### [Triggering Audio & Cinematic Directions (ink GitHub issue #228)](https://github.com/inkle/ink/issues/228)

- **Authors / Org:** Ink GitHub community
- **Type:** issue/discussion thread
- **Published:** 2018+
- **Accessed:** 2026-05-18
- **Relevance:** low
- **What this contributed:** Confirms that authors regularly ask for richer metadata signaling than tags provide and that the community's answer is "use a convention you author yourself, layer it on tags or external functions" — Inkle does not provide a canonical recipe for audio/cinematic cues. This is the gap Dink and similar pipelines fill. poltergink shouldn't try to fill it either.

## Synthesis

**The single most important finding:** *Inkle deliberately ships three separate primitives — tags, external functions, variable observers — and intentionally does not provide a unified event API.* Authors and integrators choose per-need from those three (and occasionally invent a fourth, like Ares' text-prefix DSL). This is design intent on Inkle's part, not an oversight, and it shapes what poltergink should ship.

The three primitives, with the contexts they're idiomatic for:

- **Tags** are the canonical first choice for declarative, side-effect-free metadata: speaker identity, emotion / expression cues, line IDs for localization, ambient state hints, named flags. Tags are strings; structured conventions like `key:value` are author-side and parsed on the consumer side (the `.reduce()` pattern is the de-facto idiom). Pixel Crushers uses `Actor=Bob`. Roha uses `face_smile`. Nordhagen uses `Shaw_Chap1_Joy_Line2`. Each project picks its own shape.
- **External functions** are for imperative side effects and complex game logic: playing a sound at a specific narrative moment, mutating game state in response to a story event, calling out to the host with structured arguments. They require host-side binding (`BindExternalFunction(name, fn, lookaheadSafe)`). The `lookaheadSafe` flag is non-obvious and load-bearing: pure functions can be marked `true` and re-evaluated freely during lookahead; side-effecting ones must be `false` or they fire multiple times. Inkle documents this explicitly; community discussion (#131, #228) confirms the hazard is real.
- **Variable observers** are reactive callbacks that fire when a named Ink variable changes. They're documented, supported in inkjs, and rarely the primary mechanism in shipping games. Useful for keeping a host-side UI element in sync with an Ink-side score, mood, or progress counter.

A fourth pattern — **text-prefix DSLs**, where the author writes `:: VERB args` lines and the host parses prose output as a command stream — exists in the wild (Project Ares v9, the `:: CMD` convention) but is not endorsed by Inkle or any of the major integration libraries. Inkle's docs mention "parse text directly for flexible, project-specific instructions" once, in passing. Ian Thomas (Dink) and Johnnemann Nordhagen explicitly avoid it in favor of structured tags + compile-time metadata extraction. Its tradeoff is that it gives you a flexible event stream at the cost of conflating it with the narrative prose — text rewrites can break parsing, and localization gets messy. It's an escape hatch, not a recommended primary mechanism.

**Categories of events real games emit**, synthesized across the sources: speaker / actor (universal), emotion / expression cue (Roha, Pixel Crushers), audio cue file name (Echodog, Inkle samples), visual effect trigger (Roha), scene / location marker (Echodog), UI state changes (Pixel Crushers, GDevelop), line ID for localization (Nordhagen, Thomas), progress / checkpoint tracking (Echodog via variables, common pattern), state sync of game variables (Roha), and conditional system messages (implicit in several sources). Different projects implement different subsets, with different syntaxes. *None* of them treats event categories as a runtime-level concern — every project layers categories on top of the three primitives.

**Tradeoffs in practice**, drawn from community discussion and the Dink case study:

- Tags scale well until you need *structured* events, at which point parsing becomes brittle (different projects use `:`, `=`, or no separator; tags can be re-evaluated as Ink expressions per RunningYourInk.md; tag ordering is not guaranteed). Dink emerged specifically to address this gap.
- External functions are powerful but ceremony-heavy (every callable must be bound host-side), and the lookahead-safety distinction is a real footgun. Issue #131 shows community skepticism about reaching for them as a first choice.
- Variable observers are underused in production. Theoretically reactive, but most shipping games don't expose Ink variables that fine-grained to the host.
- The notable gap Inkle hasn't filled: **choices cannot be tagged the same way lines can**, which Nordhagen and several others work around with author convention. (Actually — inkjs *does* expose `Choice.tags`, contrary to some older community claims. This may be a recent addition or a misconception from the Unity-Ink era. Worth confirming in implementation.)

**What poltergink should expose as primitives, given all of the above:**

1. Raw tags — already exposed as `Scene.tags` and `Choice.tags`. Keep these as raw `readonly string[]`. Do not parse them or impose a convention.

2. An optional structured-tags helper — `parseTags(tags, separator = ":"): Record<string, string>` as a utility, not a default. Consumers who want the `{speaker: "Bob"}` shape call it; consumers who want raw strings ignore it.

3. External function binding — `Story.bindExternal(name, fn, { lookaheadSafe?: boolean })`. Wrap inkjs's `BindExternalFunction` with TypeScript types and a clear-eyed default of `lookaheadSafe: false` (the safer choice for unknown functions). Document the hazard in TSDoc and in the published API page.

4. Variable observation — `Story.observeVariable<T>(name, listener): () => void` returning an unsubscribe. Wrap inkjs's `ObserveVariable`.

5. Knot-level and global tags — expose `Story.globalTags` and `Story.tagsForPath(path)`. These are documented inkjs APIs we don't currently surface.

6. A typed `NarrativeEvent` discriminated union — *opt-in*, not the default. Consumers who want a single event-stream view can subscribe; consumers who prefer to pull tags from `Scene.tags` and variables from observers continue to do so. The union covers what Ink actually emits, not what consumers might want:

   ```ts
   type NarrativeEvent =
     | { type: "line"; text: string; tags: readonly string[]; index: number }
     | { type: "choice-prompt"; choices: readonly Choice[] }
     | { type: "external-call"; name: string; args: readonly unknown[]; result: unknown }
     | { type: "variable-change"; name: string; oldValue: unknown; newValue: unknown }
     | { type: "story-ended"; finalScene: Scene };
   ```

7. **Crucially, no library-defined event categories like `audio:` or `mood:`.** Those are consumer conventions. Project Ares is free to subscribe to `line` events and parse `:: CMD` prefixes on their own; another consumer is free to subscribe to the same `line` events and parse Pixel-Crushers-style `Actor=Bob` tags; a third can use external function bindings and ignore tags entirely. Poltergink stays out of the way.

### What this means for the persona / memory work specifically

`EpisodicMemory.event` should hold the full `NarrativeEvent[]` that fired between this choice and the next, not just a text summary. When the persona reflects on what happened, the LLM gets to see "I chose X, which advanced to scene Y, during which line tag `audio:tense.wav` fired and variable `npc.trust` changed from 0.5 to 0.2". That's the substrate from which mood-congruent memory and persona-driven decisions can actually work.

## Documentation honesty

**Well-documented (Inkle vendor docs):** the three primitives, the lookahead-safety distinction, basic tag and variable observer semantics, the JSON runtime format.

**Validated in production (multiple shipping sources):** the `key:value` tags convention, the speaker-tag pattern (in various syntaxes), external functions for audio and game-state coupling, the unidirectional "runtime emits, consumer parses, host renders" loop.

**Emerging / community-driven, not vendor-endorsed:** compile-time metadata extraction (Dink), reactive UI via variable observers (theoretically sound, rare in production), structured-choice tagging via author convention (workaround for an Ink-level gap).

**Folk wisdom / unvalidated / cautioned against:** text-prefix DSLs as primary mechanism (single mention in Inkle docs, no production endorsement, two named practitioners explicitly avoid it). The `:: CMD` approach used by Ares v9 falls in this bucket — it's a valid project-internal convention, but generalizing it as "the way to do events in Ink" would be unwarranted.

**Couldn't fully verify:** whether any of Inkle's own published commercial games (80 Days, Heaven's Vault, Sorcery!, Overboard!, A Highland Song, Pendragon) use these primitives in idiosyncratic ways in their shipping source — that source isn't public. The free demos and samples in `inkle/ink` (intercept, crime, overboard fragments) demonstrate the canonical use of tags and the same patterns documented in WritingWithInk.md.

## Downstream uses

- Design of poltergink's `NarrativeEvent` discriminated union and the `Story.bindExternal` / `Story.observeVariable` / `Story.globalTags` / `Story.tagsForPath` API surface. Pending implementation — will likely be a small task that lands before task #6 (Persona) since `EpisodicMemory` references event records.
- Refinement of the persona's `EpisodicMemory` shape — events go in the per-turn record alongside scene text and decision, so the persona's reflections can reason over consequences, not just choices.
- An eventual "events" page in the docs site (task #8), with the four-mechanism breakdown and recommendations for which to reach for first.
- Extends the same-day [LLM persona instruction best practices](./2026-05-18-llm-persona-best-practices.md) and the [emotion-and-memory research](./2026-05-18-llm-persona-emotion-and-memory.md) (pending file) — the three pieces together define the full input picture for designing the Persona layer.
