import { SCALES, SCALE_NAMES, PROGRESSION_TEMPLATES, RHYTHM_CELLS, diatonicTriad, pick, pickWeightedIndex, } from "./theory.js";
// General MIDI program numbers (0-indexed) used for instrument variety per track role.
export const GM = {
    bass: [33, 34, 35, 36, 38], // fingered/picked/fretless/slap/synth bass
    chordsPad: [4, 5, 50, 51, 89, 90, 91], // electric piano, synth strings/pads
    melodyLead: [1, 4, 11, 24, 40, 56, 73, 80], // piano, e.piano, vibes, guitar, violin, trumpet, flute, lead synth
    arp: [81, 82, 88, 92, 99], // saw lead, calliope lead, new age pad, sweep pad, fx
};
export const UNITS_PER_BEAT = 4;
export const BEATS_PER_BAR = 4;
export const UNITS_PER_BAR = UNITS_PER_BEAT * BEATS_PER_BAR; // 16
/**
 * Build the abstract song plan: key, scale, tempo, section list with bar counts,
 * and a chord progression (diatonic triads) per section. Targets ~30-45s total.
 */
export function planSong(rng) {
    const rootMidi = 48 + Math.floor(rng() * 12); // C3..B3 anchor; tracks apply their own octave shift
    const scaleName = pick(rng, SCALE_NAMES);
    const scale = SCALES[scaleName];
    const isMinorish = scaleName === "minorAeolian" || scaleName === "harmonicMinor" || scaleName === "phrygian";
    const tempo = 78 + Math.floor(rng() * 70); // 78-147 BPM: meaningful spread across songs
    const secPerBar = (60 / tempo) * BEATS_PER_BAR;
    const sectionTypes = ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"];
    const sectionBars = { intro: 2, verse: 4, chorus: 4, bridge: 2, outro: 2 };
    let plan = sectionTypes.map((type) => ({ type, bars: sectionBars[type] }));
    let totalBars = plan.reduce((s, p) => s + p.bars, 0);
    let totalSec = totalBars * secPerBar;
    // Adjust to land between 30 and 45s by trimming/extending chorus repeats first.
    while (totalSec < 30) {
        plan.push({ type: "chorus", bars: sectionBars.chorus });
        totalBars = plan.reduce((s, p) => s + p.bars, 0);
        totalSec = totalBars * secPerBar;
    }
    while (totalSec > 45 && plan.length > 4) {
        const idx = plan.findIndex((p, i) => i > 0 && i < plan.length - 1 && (p.type === "verse" || p.type === "chorus"));
        if (idx === -1)
            break;
        plan.splice(idx, 1);
        totalBars = plan.reduce((s, p) => s + p.bars, 0);
        totalSec = totalBars * secPerBar;
    }
    // One progression template for verses, a different one for chorus, for contrast.
    const verseProg = pick(rng, PROGRESSION_TEMPLATES);
    let chorusProg = pick(rng, PROGRESSION_TEMPLATES);
    if (chorusProg.name === verseProg.name && PROGRESSION_TEMPLATES.length > 1) {
        chorusProg = PROGRESSION_TEMPLATES[(PROGRESSION_TEMPLATES.indexOf(chorusProg) + 1) % PROGRESSION_TEMPLATES.length];
    }
    const bridgeProg = pick(rng, PROGRESSION_TEMPLATES);
    const progByType = {
        verse: verseProg,
        chorus: chorusProg,
        bridge: bridgeProg,
        intro: verseProg,
        outro: chorusProg,
    };
    const sections = plan.map((p) => {
        const prog = progByType[p.type];
        const chords = [];
        for (let bar = 0; bar < p.bars; bar++) {
            const degree = prog.degrees[bar % prog.degrees.length];
            chords.push(diatonicTriad(scale, degree));
        }
        return { type: p.type, bars: p.bars, chords };
    });
    return { rootMidi, scaleName, scale, isMinorish, tempo, secPerBar, sections, totalBars, estSeconds: totalSec };
}
/**
 * Generate a melodic line for one section, biased toward chord tones on strong beats
 * and stepwise scale motion elsewhere, with occasional rests for phrasing.
 */
function generateMelodyForSection(rng, plan, section, energy) {
    const events = [];
    const scaleLen = plan.scale.length;
    let lastDegreeIdx = 0;
    for (let bar = 0; bar < section.bars; bar++) {
        const chord = section.chords[bar];
        const cell = pick(rng, RHYTHM_CELLS);
        let cursor = 0;
        for (const dur of cell) {
            const startUnit = bar * UNITS_PER_BAR + cursor;
            cursor += dur;
            const isStrongBeat = startUnit % UNITS_PER_BEAT === 0;
            const useChordTone = rng() < (isStrongBeat ? 0.75 : 0.4 + energy * 0.15);
            let semitone;
            if (useChordTone) {
                semitone = pick(rng, chord);
            }
            else {
                const step = pick(rng, [-2, -1, -1, 1, 1, 2]);
                lastDegreeIdx += step;
                const octaveShift = Math.floor(lastDegreeIdx / scaleLen) * 12;
                const wrapped = ((lastDegreeIdx % scaleLen) + scaleLen) % scaleLen;
                semitone = plan.scale[wrapped] + octaveShift;
            }
            const isRest = rng() < Math.max(0.04, 0.18 - energy * 0.12);
            events.push({ startUnit, durationUnits: dur, semitoneOffset: semitone, isRest });
        }
    }
    return events;
}
/** Generate a steady bass line: root/fifth of the chord per bar, with rhythmic variety for groove. */
function generateBassForSection(rng, section) {
    const events = [];
    for (let bar = 0; bar < section.bars; bar++) {
        const chord = section.chords[bar];
        const root = chord[0] - 12;
        const fifth = chord[2] - 12;
        const pattern = pickWeightedIndex(rng, [5, 3, 2]); // 0: simple, 1: root+fifth, 2: syncopated
        const base = bar * UNITS_PER_BAR;
        if (pattern === 0) {
            events.push({ startUnit: base, durationUnits: UNITS_PER_BAR, semitoneOffset: root, isRest: false });
        }
        else if (pattern === 1) {
            events.push({ startUnit: base, durationUnits: 8, semitoneOffset: root, isRest: false });
            events.push({ startUnit: base + 8, durationUnits: 8, semitoneOffset: fifth, isRest: false });
        }
        else {
            events.push({ startUnit: base, durationUnits: 6, semitoneOffset: root, isRest: false });
            events.push({ startUnit: base + 6, durationUnits: 2, semitoneOffset: root, isRest: false });
            events.push({ startUnit: base + 8, durationUnits: 8, semitoneOffset: fifth, isRest: false });
        }
    }
    return events;
}
/** Generate sustained chord-pad events: one block chord held for the whole bar. */
function generateChordsForSection(section) {
    const events = [];
    for (let bar = 0; bar < section.bars; bar++) {
        events.push({ startUnit: bar * UNITS_PER_BAR, durationUnits: UNITS_PER_BAR, chord: section.chords[bar], isRest: false });
    }
    return events;
}
/**
 * Generate an arpeggio line cycling through the bar's chord tones (plus the octave above).
 * Only used in higher-energy sections (chorus/bridge) for contrast.
 */
function generateArpForSection(rng, section, active) {
    const events = [];
    if (!active)
        return events;
    const subdivision = pick(rng, [2, 4]); // 8th or quarter-ish subdivision in 16th units
    for (let bar = 0; bar < section.bars; bar++) {
        const chord = section.chords[bar];
        const extended = [chord[0], chord[1], chord[2], chord[0] + 12];
        const direction = pick(rng, [1, -1]);
        const seq = direction === 1 ? extended : [...extended].reverse();
        let cursor = 0;
        let i = 0;
        while (cursor < UNITS_PER_BAR) {
            const dur = Math.min(subdivision, UNITS_PER_BAR - cursor);
            events.push({ startUnit: bar * UNITS_PER_BAR + cursor, durationUnits: dur, semitoneOffset: seq[i % seq.length], isRest: false });
            cursor += dur;
            i++;
        }
    }
    return events;
}
/**
 * Generate a kick/snare/hihat drum pattern using GM percussion note numbers
 * (36 kick, 38 snare, 42 closed hihat, 46 open hihat, 49 crash).
 */
function generateDrumsForSection(rng, section, isFill) {
    const KICK = 36, SNARE = 38, HIHAT = 42, OPENHAT = 46, CRASH = 49;
    const events = [];
    for (let bar = 0; bar < section.bars; bar++) {
        const base = bar * UNITS_PER_BAR;
        for (let u = 0; u < UNITS_PER_BAR; u += 2) {
            const useOpen = rng() < 0.08;
            events.push({ startUnit: base + u, durationUnits: 2, midiNote: useOpen ? OPENHAT : HIHAT, isRest: false, velocity: useOpen ? 60 : 45 });
        }
        events.push({ startUnit: base + 0, durationUnits: 2, midiNote: KICK, isRest: false, velocity: 100 });
        events.push({ startUnit: base + 8, durationUnits: 2, midiNote: KICK, isRest: false, velocity: 95 });
        if (rng() < 0.35) {
            events.push({ startUnit: base + 6, durationUnits: 2, midiNote: KICK, isRest: false, velocity: 70 });
        }
        events.push({ startUnit: base + 4, durationUnits: 2, midiNote: SNARE, isRest: false, velocity: 95 });
        events.push({ startUnit: base + 12, durationUnits: 2, midiNote: SNARE, isRest: false, velocity: 95 });
        if (isFill && bar === section.bars - 1) {
            events.push({ startUnit: base, durationUnits: UNITS_PER_BAR, midiNote: CRASH, isRest: false, velocity: 110 });
        }
    }
    return events;
}
/**
 * Build the full multi-track composition: plan + per-track absolute-time note events
 * (melody, bass, chords/pad, arp, drums), ready for MIDI rendering.
 */
export function composeSong(rng) {
    const plan = planSong(rng);
    const tracks = { melody: [], bass: [], chords: [], arp: [], drums: [] };
    let barOffset = 0;
    plan.sections.forEach((section, idx) => {
        const energy = section.type === "chorus" ? 0.9 : section.type === "bridge" ? 0.6 : section.type === "outro" ? 0.3 : 0.5;
        const isFill = idx < plan.sections.length - 1 && plan.sections[idx + 1].type !== section.type;
        const offsetUnits = barOffset * UNITS_PER_BAR;
        const melody = generateMelodyForSection(rng, plan, section, energy).map((e) => ({ ...e, startUnit: e.startUnit + offsetUnits }));
        const bass = generateBassForSection(rng, section).map((e) => ({ ...e, startUnit: e.startUnit + offsetUnits }));
        const chords = generateChordsForSection(section).map((e) => ({ ...e, startUnit: e.startUnit + offsetUnits }));
        const arpActive = section.type === "chorus" || section.type === "bridge";
        const arp = generateArpForSection(rng, section, arpActive).map((e) => ({ ...e, startUnit: e.startUnit + offsetUnits }));
        const drums = generateDrumsForSection(rng, section, isFill).map((e) => ({ ...e, startUnit: e.startUnit + offsetUnits }));
        tracks.melody.push(...melody);
        tracks.bass.push(...bass);
        tracks.chords.push(...chords);
        tracks.arp.push(...arp);
        tracks.drums.push(...drums);
        barOffset += section.bars;
    });
    return { plan, tracks };
}
//# sourceMappingURL=composer.js.map