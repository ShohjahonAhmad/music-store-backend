import { type Composition } from "./composer.js";
/**
 * Render a composed song into a MIDI Buffer. `rng` must be the same seeded generator used
 * for composeSong(), continued forward, so instrument/effect choices stay deterministic per seed.
 */
export declare function renderToMidiBuffer(composition: Composition, rng: () => number): Buffer;
//# sourceMappingURL=render.d.ts.map