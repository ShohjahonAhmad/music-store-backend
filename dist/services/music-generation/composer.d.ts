import { type ScaleName } from "./theory.js";
export declare const GM: {
    readonly bass: readonly [33, 34, 35, 36, 38];
    readonly chordsPad: readonly [4, 5, 50, 51, 89, 90, 91];
    readonly melodyLead: readonly [1, 4, 11, 24, 40, 56, 73, 80];
    readonly arp: readonly [81, 82, 88, 92, 99];
};
export declare const UNITS_PER_BEAT = 4;
export declare const BEATS_PER_BAR = 4;
export declare const UNITS_PER_BAR: number;
export interface SongSection {
    type: "intro" | "verse" | "chorus" | "bridge" | "outro";
    bars: number;
    chords: [number, number, number][];
}
export interface SongPlan {
    rootMidi: number;
    scaleName: ScaleName;
    scale: number[];
    isMinorish: boolean;
    tempo: number;
    secPerBar: number;
    sections: SongSection[];
    totalBars: number;
    estSeconds: number;
}
export interface NoteEventUnits {
    startUnit: number;
    durationUnits: number;
    semitoneOffset: number;
    isRest: boolean;
}
export interface ChordEventUnits {
    startUnit: number;
    durationUnits: number;
    chord: [number, number, number];
    isRest: boolean;
}
export interface DrumEventUnits {
    startUnit: number;
    durationUnits: number;
    midiNote: number;
    isRest: boolean;
    velocity: number;
}
export interface Composition {
    plan: SongPlan;
    tracks: {
        melody: NoteEventUnits[];
        bass: NoteEventUnits[];
        chords: ChordEventUnits[];
        arp: NoteEventUnits[];
        drums: DrumEventUnits[];
    };
}
/**
 * Build the abstract song plan: key, scale, tempo, section list with bar counts,
 * and a chord progression (diatonic triads) per section. Targets ~30-45s total.
 */
export declare function planSong(rng: () => number): SongPlan;
/**
 * Build the full multi-track composition: plan + per-track absolute-time note events
 * (melody, bass, chords/pad, arp, drums), ready for MIDI rendering.
 */
export declare function composeSong(rng: () => number): Composition;
//# sourceMappingURL=composer.d.ts.map