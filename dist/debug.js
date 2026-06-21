import { generateMidi } from "./services/music-generation/generateMidi.js"; // adjust path
import { renderMidiToWav } from "./services/music-generation/convertMidiToWav.js"; // adjust path
import { writeFileSync } from "node:fs";
async function main() {
    const songSeed = `${123n}-1`;
    const midi = generateMidi(songSeed);
    console.log("MIDI buffer size:", midi.length);
    const wav = await renderMidiToWav(midi);
    console.log("WAV buffer size:", wav.length);
    writeFileSync("./debug-output.wav", wav);
    console.log("Saved to ./debug-output.wav");
}
main().catch((err) => {
    console.error("FAILED:", err);
});
//# sourceMappingURL=debug.js.map