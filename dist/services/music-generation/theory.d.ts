export type ScaleName = "majorIonian" | "minorAeolian" | "dorian" | "mixolydian" | "harmonicMinor" | "phrygian";
export declare const SCALES: Record<ScaleName, number[]>;
export declare const SCALE_NAMES: ScaleName[];
/**
 * Build a diatonic triad (root, third, fifth) for a given 0-indexed scale degree,
 * stacking two further scale steps (thirds) within the scale, wrapping octaves as needed.
 */
export declare function diatonicTriad(scaleIntervals: number[], degree: number): [number, number, number];
export interface ProgressionTemplate {
    name: string;
    degrees: number[];
}
export declare const PROGRESSION_TEMPLATES: ProgressionTemplate[];
export declare const RHYTHM_CELLS: number[][];
export declare function pick<T>(rng: () => number, arr: T[]): T;
export declare function pickWeightedIndex(rng: () => number, weights: number[]): number;
//# sourceMappingURL=theory.d.ts.map