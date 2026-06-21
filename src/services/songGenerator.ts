import seedrandom from 'seedrandom';
import { faker } from "@faker-js/faker";
import type { Song, Review } from '../types/Song.js';
import titles from "../data/es-ES/titles.json" with { type: "json" };
import artists from "../data/es-ES/artists.json" with { type: "json" };
import albums from "../data/es-ES/albums.json" with { type: "json" };
import genres from "../data/es-ES/genres.json" with { type: "json" };
import esReview from "../data/es-ES/reviews.json" with { type: "json" };
import enReview from "../data/en-US/reviews.json" with { type: "json" };

const LIKE_SEED_OFFSET = 999999n;
const PAGE_SIZE = 10;

function generateSong(songSeed: bigint, index: number): Song {
    const fakerSeed = Number(songSeed % 2147483647n);
    faker.seed(fakerSeed);
    const rng = seedrandom(songSeed.toString());
    const reviews = generateReviews(songSeed.toString(), enReview);
    return {
        index,
        title:   faker.music.songName(),
        artist:  faker.music.artist(),
        album:   rng() < 0.2 ? "Single" : faker.music.album(),
        genre:   faker.music.genre(),
        reviews,
        likes:   0,
    };
}

export function generateSpanishSong(seed: bigint, index: number): Song {
    const titleRng  = seedrandom(`${seed}-title`);
    const artistRng = seedrandom(`${seed}-artist`);
    const albumRng  = seedrandom(`${seed}-album`);
    const genreRng  = seedrandom(`${seed}-genre`);
    const reviews   = generateReviews(seed.toString(), esReview);
    return {
        index,
        title:  titles[Math.floor(titleRng()  * titles.length)]!,
        artist: artists[Math.floor(artistRng() * artists.length)]!,
        album:  albums[Math.floor(albumRng()  * albums.length)]!,
        genre:  genres[Math.floor(genreRng()  * genres.length)]!,
        reviews,
        likes: 0,
    };
}

function generateReviews(seed: string, reviews: Review[]) {
    const reviewCountRng = seedrandom(`${seed}-reviewCount`);
    const reviewCount    = 1 + Math.floor(reviewCountRng() * 5);
    const generatedReviews: Review[] = [];
    const reviewRng = seedrandom(`${seed}-review`);
    for (let i = 0; i < reviewCount; i++) {
        generatedReviews.push(reviews[Math.floor(reviewRng() * reviews.length)]!);
    }
    return generatedReviews;
}

export function generateSongs(
    seed: bigint,
    page: number,
    likesNumber: number,
    locale: string
): Song[] {
    const songs: Song[] = [];
    const startIndex = (page - 1) * PAGE_SIZE + 1;
    for (let i = 0; i < PAGE_SIZE; i++) {
        const index    = startIndex + i;
        const songSeed = seed * 1000n + BigInt(index);
        const song     = locale === "es"
            ? generateSpanishSong(songSeed, index)
            : generateSong(songSeed, index);
        song.likes = generateLikes(likesNumber, songSeed + LIKE_SEED_OFFSET);
        songs.push(song);
    }
    return songs;
}

function generateLikes(averageLikes: number, likesSeed: bigint): number {
    const rng      = seedrandom(likesSeed.toString());
    const whole    = Math.floor(averageLikes);
    const fraction = averageLikes - whole;
    return rng() < fraction ? whole + 1 : whole;
}

const PROGRESSIONS: number[][][] = [
    // C major  I–V–vi–IV
    [[261.63,329.63,392.0],[392.0,493.88,587.33],[440.0,523.25,659.25],[349.23,440.0,523.25]],
    // A minor  vi–IV–I–V
    [[440.0,523.25,659.25],[349.23,440.0,523.25],[261.63,329.63,392.0],[392.0,493.88,587.33]],
    // C major  I–IV–V–I  (blues feel)
    [[261.63,329.63,392.0],[349.23,440.0,523.25],[392.0,493.88,587.33],[261.63,329.63,392.0]],
    // C major  ii–V–I–vi (jazz)
    [[293.66,349.23,440.0],[392.0,493.88,587.33],[261.63,329.63,392.0],[440.0,523.25,659.25]],
    // C major  I–iii–IV–V
    [[261.63,329.63,392.0],[329.63,392.0,493.88],[349.23,440.0,523.25],[392.0,493.88,587.33]],
    // D major  I–V–vi–IV
    [[293.66,369.99,440.0],[440.0,554.37,659.25],[493.88,587.33,739.99],[369.99,440.0,554.37]],
    // G major  I–V–vi–IV
    [[392.0,493.88,587.33],[587.33,739.99,880.0],[659.25,783.99,987.77],[523.25,659.25,783.99]],
    // E minor  i–VII–VI–VII
    [[164.81,196.0,246.94],[146.83,185.0,220.0],[130.81,164.81,196.0],[146.83,185.0,220.0]],
    // F major  I–IV–vi–V
    [[174.61,220.0,261.63],[261.63,329.63,392.0],[349.23,440.0,523.25],[293.66,369.99,440.0]],
    // A major  I–IV–I–V
    [[220.0,277.18,329.63],[293.66,369.99,440.0],[220.0,277.18,329.63],[329.63,415.30,493.88]],
];

function pianoWave(frequency: number, t: number): number {
    if (t < 0) return 0;
    const envelope = Math.min(1, t / 0.008) * Math.exp(-t / 0.8);
    return (
        Math.sin(2 * Math.PI * frequency       * t) * 1.00 +
        Math.sin(2 * Math.PI * frequency * 2   * t) * 0.40 +
        Math.sin(2 * Math.PI * frequency * 3   * t) * 0.20 +
        Math.sin(2 * Math.PI * frequency * 4   * t) * 0.10 +
        Math.sin(2 * Math.PI * frequency * 5   * t) * 0.05
    ) * envelope * 0.35;
}

function guitarWave(frequency: number, t: number): number {
    if (t < 0) return 0;
    const envelope = Math.min(1, t / 0.002) * Math.exp(-t / 0.35);
    return (
        Math.sin(2 * Math.PI * frequency         * t) * 1.00 +
        Math.sin(2 * Math.PI * frequency * 2     * t) * 0.60 +
        Math.sin(2 * Math.PI * frequency * 3     * t) * 0.15 +
        Math.sin(2 * Math.PI * frequency * 1.002 * t) * 0.30   
    ) * envelope * 0.30;
}

function padWave(frequency: number, t: number): number {
    if (t < 0) return 0;
    const envelope = Math.min(1, t / 0.15) * Math.exp(-t / 3.0);
    return (
        Math.sin(2 * Math.PI * frequency       * t) * 1.00 +
        Math.sin(2 * Math.PI * frequency * 2   * t) * 0.20 +
        Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.15    
    ) * envelope * 0.25;
}

function bassWave(frequency: number, t: number): number {
    if (t < 0) return 0;
    const envelope = Math.min(1, t / 0.005) * Math.exp(-t / 0.5);
    return (
        Math.sin(2 * Math.PI * frequency     * t) * 1.00 +
        Math.sin(2 * Math.PI * frequency * 2 * t) * 0.30 +
        Math.sin(2 * Math.PI * frequency * 3 * t) * 0.10
    ) * envelope * 0.50;
}

function kickDrum(t: number): number {
    if (t < 0 || t > 0.4) return 0;
    const freq     = 150 * Math.exp(-t * 25);
    const envelope = Math.exp(-t * 12);
    return Math.sin(2 * Math.PI * freq * t) * envelope;
}

function snareDrum(t: number, noiseVal: number): number {
    if (t < 0 || t > 0.2) return 0;
    const noise    = noiseVal * 2 - 1;
    const tone     = Math.sin(2 * Math.PI * 180 * t);
    const envelope = Math.exp(-t * 25);
    return (noise * 0.65 + tone * 0.35) * envelope;
}

function hihat(t: number, noiseVal: number, open: boolean): number {
    if (t < 0) return 0;
    const decay    = open ? 0.25 : 0.04;
    const envelope = Math.exp(-t / decay);
    const noise    = noiseVal * 2 - 1;
    const tone     = Math.sin(2 * Math.PI * 8000 * t) * 0.3 +
                     Math.sin(2 * Math.PI * 6000 * t) * 0.3;
    return (noise * 0.6 + tone) * envelope * 0.4;
}

function makeNoiseBuffer(size: number, rng: seedrandom.PRNG): Float32Array {
    const buf = new Float32Array(size);
    for (let i = 0; i < size; i++) buf[i] = rng();
    return buf;
}


const SONG_DURATION_SECONDS = 30;

export function generateWav(seed: string): Buffer {
    const rng = seedrandom(seed);

    const progression  = PROGRESSIONS[Math.floor(rng() * PROGRESSIONS.length)]!;
    const bpm          = 75 + Math.floor(rng() * 85);
    const melodyInstr  = rng() > 0.5 ? "guitar" : "piano";
    const chordInstr   = rng() > 0.4 ? "pad"    : "piano";
    const hasDrums     = rng() > 0.25;
    const openHatFreq  = rng() > 0.5;

    const beatDuration  = 60 / bpm;
    const noteDuration  = beatDuration / 2;
    const chordDuration = beatDuration * 4;                     

    const sampleRate     = 44100;
    const noteSamples    = Math.floor(sampleRate * noteDuration);
    const chordSamples   = Math.floor(sampleRate * chordDuration);
    const totalSamples   = Math.floor(sampleRate * SONG_DURATION_SECONDS);

    const samplesPerLoop  = chordSamples * progression.length;
    const numberOfLoops   = Math.ceil(totalSamples / samplesPerLoop);
    const fullProgression = Array.from({ length: numberOfLoops }, () => progression).flat();

    const melodyPerChord: number[][] = progression.map(chord => {
        const extended = [
            chord[0]! * 0.944,
            chord[0]!,
            chord[1]!,
            chord[2]!,
            chord[0]! * 2,
            chord[1]! * 1.5,
        ];
        return Array.from({ length: 8 }, () =>
            extended[Math.floor(rng() * extended.length)]!
        );
    });

    const bassPattern = Array.from({ length: 8 }, (_, i) =>
        i === 0 || i === 4 ? 1 : rng() > 0.6 ? 1 : 0
    );

    const noiseRng = seedrandom(`${seed}-noise`);
    const noiseBuf = makeNoiseBuffer(totalSamples, noiseRng);

    const samples = new Float32Array(totalSamples);

    for (let ci = 0; ci < fullProgression.length; ci++) {
        const chordOffset = ci * chordSamples;
        if (chordOffset >= totalSamples) break;  

        const chord    = fullProgression[ci]!;
        const bassFreq = chord[0]! / 2;

        const melodyIndex   = ci % progression.length;
        const melodyForChord = melodyPerChord[melodyIndex]!;

        const samplesThisChord = Math.min(chordSamples, totalSamples - chordOffset);

        for (let i = 0; i < samplesThisChord; i++) {
            const globalI = chordOffset + i;
            const t       = i / sampleRate;

            const chordFn  = chordInstr === "pad" ? padWave : pianoWave;
            const chordSmp = (
                chordFn(chord[0]!, t) +
                chordFn(chord[1]!, t) +
                chordFn(chord[2]!, t)
            ) / 3;

            const noteIndex  = Math.min(Math.floor(i / noteSamples), 7);
            const melodyFreq = melodyForChord[noteIndex]!;
            const noteLocalT = (i % noteSamples) / sampleRate;
            const melodyFn   = melodyInstr === "guitar" ? guitarWave : pianoWave;
            const melodySmp  = melodyFn(melodyFreq, noteLocalT);

            const bassSlot   = Math.floor(i / noteSamples);
            const bassOn     = bassPattern[bassSlot % 8] === 1;
            const bassLocalT = (i % noteSamples) / sampleRate;
            const bassSmp    = bassOn ? bassWave(bassFreq, bassLocalT) : 0;

            let drumSmp = 0;
            if (hasDrums) {
                const beatSamples = Math.floor(sampleRate * beatDuration);
                const beatIndex   = Math.floor(i / beatSamples) % 4;
                const beatLocalT  = (i % beatSamples) / sampleRate;
                const noise       = noiseBuf[globalI] ?? 0.5;

                if (beatIndex === 0 || beatIndex === 2) {
                    drumSmp += kickDrum(beatLocalT) * 0.55;
                }
                if (beatIndex === 1 || beatIndex === 3) {
                    drumSmp += snareDrum(beatLocalT, noise) * 0.40;
                }

                const hatSamples = Math.floor(sampleRate * noteDuration);
                const hatLocalT  = (i % hatSamples) / sampleRate;
                const hatBeat    = Math.floor(i / hatSamples) % 2;
                const isOpen     = openHatFreq && hatBeat === 1;
                drumSmp += hihat(hatLocalT, noise, isOpen) * 0.25;
            }

            const fadeStartSample = totalSamples - sampleRate * 2;
            const fadeFactor = globalI > fadeStartSample
                ? 1 - (globalI - fadeStartSample) / (sampleRate * 2)
                : 1;

            samples[globalI] = (
                chordSmp  * 0.18 +
                melodySmp * 0.32 +
                bassSmp   * 0.22 +
                drumSmp   * 0.28
            ) * fadeFactor;
        }
    }

    let peak = 0;
    for (let i = 0; i < samples.length; i++) {
        const abs = Math.abs(samples[i]!);
        if (abs > peak) peak = abs;
    }
    const gain = peak > 0 ? 0.9 / peak : 1;
    for (let i = 0; i < samples.length; i++) {
        samples[i]! *= gain;
    }

    return createWav(Array.from(samples), sampleRate);
}


function createWav(samples: number[], sampleRate: number): Buffer {
    const dataSize = samples.length * 2;
    const buffer   = Buffer.alloc(44 + dataSize);

    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);           
    buffer.writeUInt16LE(1, 22);           
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write("data", 36);
    buffer.writeUInt32LE(dataSize, 40);

    let offset = 44;
    for (const sample of samples) {
        const value = Math.max(-1, Math.min(1, sample));
        buffer.writeInt16LE(Math.floor(value * 32767), offset);
        offset += 2;
    }

    return buffer;
}