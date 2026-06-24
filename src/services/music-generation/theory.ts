export type ScaleName =
    | "majorIonian"
    | "minorAeolian"
    | "dorian"
    | "mixolydian"
    | "harmonicMinor"
    | "phrygian";

export const SCALES: Record<ScaleName, number[]> = {
    majorIonian:   [0, 2, 4, 5, 7, 9, 11],
    minorAeolian:  [0, 2, 3, 5, 7, 8, 10],
    dorian:        [0, 2, 3, 5, 7, 9, 10],
    mixolydian:    [0, 2, 4, 5, 7, 9, 10],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    phrygian:      [0, 1, 3, 5, 7, 8, 10],
};

export const SCALE_NAMES = Object.keys(SCALES) as ScaleName[];

export function diatonicTriad(scaleIntervals: number[], degree: number): [number, number, number] {
    const len = scaleIntervals.length;
    const root  = scaleIntervals[degree % len]! + 12 * Math.floor(degree / len);
    const third = scaleIntervals[(degree + 2) % len]! + 12 * Math.floor((degree + 2) / len);
    const fifth = scaleIntervals[(degree + 4) % len]! + 12 * Math.floor((degree + 4) / len);
    return [root, third, fifth];
}

export interface ProgressionTemplate {
    name: string;
    degrees: number[];
}

export const PROGRESSION_TEMPLATES: ProgressionTemplate[] = [
    { name: "I-V-vi-IV",    degrees: [0, 4, 5, 3] },
    { name: "I-IV-V-IV",    degrees: [0, 3, 4, 3] },
    { name: "vi-IV-I-V",    degrees: [5, 3, 0, 4] },
    { name: "I-vi-IV-V",    degrees: [0, 5, 3, 4] },
    { name: "ii-V-I-vi",    degrees: [1, 4, 0, 5] },
    { name: "I-V-IV-V",     degrees: [0, 4, 3, 4] },
    { name: "vi-V-IV-V",    degrees: [5, 4, 3, 4] },
    { name: "I-iii-IV-V",   degrees: [0, 2, 3, 4] },
    { name: "i-VI-III-VII", degrees: [0, 5, 2, 6] }, 
];

export const RHYTHM_CELLS: number[][] = [
    [4, 4, 4, 4],
    [2, 2, 4, 4, 4],
    [4, 2, 2, 4, 4],
    [2, 2, 2, 2, 4, 4],
    [6, 2, 4, 4],
    [3, 3, 2, 4, 4],
    [4, 4, 2, 2, 4],
    [8, 4, 4],
    [2, 2, 2, 2, 2, 2, 4],
];

export function pick<T>(rng: () => number, arr: T[]): T {
    return arr[Math.floor(rng() * arr.length)]!;
}

export function pickWeightedIndex(rng: () => number, weights: number[]): number {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i]!;
        if (r <= 0) return i;
    }
    return weights.length - 1;
}
