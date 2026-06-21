import MidiWriter from "midi-writer-js";
import { GM, UNITS_PER_BEAT } from "./composer.js";
import { pick } from "./theory.js";
// midi-writer-js default resolution is 128 ticks per quarter note. 1 of our composer "units"
// is a sixteenth note, so 1 unit = TICKS_PER_BEAT / UNITS_PER_BEAT ticks.
const TICKS_PER_BEAT = 128;
const TICKS_PER_UNIT = TICKS_PER_BEAT / UNITS_PER_BEAT;
function unitsToTicks(units) {
    return Math.round(units * TICKS_PER_UNIT);
}
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function midiNumberToName(midiNumber) {
    const octave = Math.floor(midiNumber / 12) - 1;
    const n = ((midiNumber % 12) + 12) % 12;
    return `${NOTE_NAMES[n]}${octave}`;
}
/** Add reverb (CC91), chorus (CC93), and pan (CC10) sends near the start of a track. */
function applyEffects(track, { reverb, chorus, pan }) {
    track.addEvent(new MidiWriter.ControllerChangeEvent({ controllerNumber: 91, controllerValue: reverb }));
    track.addEvent(new MidiWriter.ControllerChangeEvent({ controllerNumber: 93, controllerValue: chorus }));
    track.addEvent(new MidiWriter.ControllerChangeEvent({ controllerNumber: 10, controllerValue: pan }));
}
/**
 * Build a melodic/lead/arp track from absolute-time note events, anchored at rootMidi
 * with the given General MIDI program. Optionally leads with tempo/time-signature
 * (only the first track in the Writer should set these).
 */
function buildPitchedTrack(events, rootMidi, program, rng, options) {
    const track = new MidiWriter.Track();
    if (options.tempo) {
        track.addEvent(new MidiWriter.TempoEvent({ bpm: options.tempo }));
        track.addEvent(new MidiWriter.TimeSignatureEvent(4, 4, 24, 8));
    }
    track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: program }));
    const reverb = options.reverb ?? 40 + Math.floor(rng() * 40);
    const chorus = options.chorus ?? Math.floor(rng() * 30);
    const pan = options.pan ?? 64;
    applyEffects(track, { reverb, chorus, pan });
    for (const ev of events) {
        if (ev.isRest)
            continue;
        const midiNumber = rootMidi + ev.semitoneOffset + (options.octaveShift ?? 0);
        const clamped = Math.max(0, Math.min(127, midiNumber));
        const velocity = options.baseVelocity
            ? Math.max(20, Math.min(110, options.baseVelocity + Math.floor((rng() - 0.5) * 16)))
            : 70 + Math.floor((rng() - 0.5) * 20);
        track.addEvent(new MidiWriter.NoteEvent({
            pitch: [midiNumberToName(clamped)],
            duration: `T${unitsToTicks(ev.durationUnits)}`,
            startTick: unitsToTicks(ev.startUnit),
            velocity,
        }));
    }
    return track;
}
/** Build the sustained chord/pad track from block-chord events (one chord held per bar). */
function buildChordTrack(events, rootMidi, program, rng, options) {
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: program }));
    const reverb = options.reverb ?? 50 + Math.floor(rng() * 40);
    const chorus = options.chorus ?? 20 + Math.floor(rng() * 30);
    const pan = options.pan ?? 64;
    applyEffects(track, { reverb, chorus, pan });
    for (const ev of events) {
        const pitches = ev.chord.map((semi) => {
            const midiNumber = Math.max(0, Math.min(127, rootMidi + semi + (options.octaveShift ?? 0)));
            return midiNumberToName(midiNumber);
        });
        track.addEvent(new MidiWriter.NoteEvent({
            pitch: pitches,
            duration: `T${unitsToTicks(ev.durationUnits)}`,
            startTick: unitsToTicks(ev.startUnit),
            velocity: options.baseVelocity ?? 55,
        }));
    }
    return track;
}
/** Build the percussion track on GM channel 10 (kick/snare/hihat/crash). */
function buildDrumTrack(events) {
    const track = new MidiWriter.Track();
    track.addEvent(new MidiWriter.ControllerChangeEvent({ controllerNumber: 91, controllerValue: 20 }));
    for (const ev of events) {
        if (ev.isRest)
            continue;
        track.addEvent(new MidiWriter.NoteEvent({
            pitch: [midiNumberToName(ev.midiNote)],
            duration: `T${unitsToTicks(ev.durationUnits)}`,
            startTick: unitsToTicks(ev.startUnit),
            velocity: ev.velocity,
            channel: 10,
        }));
    }
    return track;
}
/**
 * Render a composed song into a MIDI Buffer. `rng` must be the same seeded generator used
 * for composeSong(), continued forward, so instrument/effect choices stay deterministic per seed.
 */
export function renderToMidiBuffer(composition, rng) {
    const { plan, tracks } = composition;
    const rootMidi = plan.rootMidi;
    const melodyProgram = pick(rng, GM.melodyLead);
    const bassProgram = pick(rng, GM.bass);
    const chordsProgram = pick(rng, GM.chordsPad);
    const arpProgram = pick(rng, GM.arp);
    const melodyTrack = buildPitchedTrack(tracks.melody, rootMidi, melodyProgram, rng, {
        octaveShift: 12,
        baseVelocity: 85,
        pan: 64,
        tempo: plan.tempo,
    });
    const bassTrack = buildPitchedTrack(tracks.bass, rootMidi, bassProgram, rng, {
        octaveShift: -12,
        baseVelocity: 90,
        reverb: 15,
        chorus: 5,
        pan: 64,
    });
    const chordsTrack = buildChordTrack(tracks.chords, rootMidi, chordsProgram, rng, {
        octaveShift: 0,
        baseVelocity: 50,
        pan: 50,
    });
    const arpTrack = buildPitchedTrack(tracks.arp, rootMidi, arpProgram, rng, {
        octaveShift: 12,
        baseVelocity: 60,
        reverb: 60,
        chorus: 40,
        pan: 80,
    });
    const drumTrack = buildDrumTrack(tracks.drums);
    const writer = new MidiWriter.Writer([melodyTrack, bassTrack, chordsTrack, arpTrack, drumTrack]);
    const dataUri = writer.dataUri();
    const base64 = dataUri.split(",")[1];
    return Buffer.from(base64, "base64");
}
//# sourceMappingURL=render.js.map