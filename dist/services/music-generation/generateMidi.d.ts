/**
 * Generate a ~30-45s MIDI song (5 tracks: melody, bass, chords/pad, arp, drums)
 * deterministically from `seed`. Same seed always produces byte-identical output,
 * matching the determinism contract used by generateSong/generateSpanishSong.
 *
 * Pass a string built the same way as the rest of the seeding scheme, e.g.
 * `${songSeed}-midi` where songSeed is the per-song bigint seed already used
 * for title/artist/album/genre generation. Using a distinct sub-seed namespace
 * (the "-midi" suffix) keeps the audio's randomness independent of, but still
 * derived from, the same song seed -- consistent with how titles/artists/reviews
 * each get their own seedrandom(`${seed}-xxx`) stream.
 */
export declare function generateMidi(seed: string): Buffer;
//# sourceMappingURL=generateMidi.d.ts.map