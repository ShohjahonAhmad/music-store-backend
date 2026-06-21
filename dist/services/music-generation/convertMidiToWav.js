import fs from "node:fs/promises";
import { audioToWav, BasicMIDI, SoundBankLoader, SpessaSynthProcessor, SpessaSynthSequencer, } from "spessasynth_core";
const SAMPLE_RATE = 48_000;
const BUFFER_SIZE = 128;
let soundBankPromise = null;
async function getSoundBank() {
    if (!soundBankPromise) {
        soundBankPromise = fs.readFile("./soundfonts/CREATIVE_8MBGM.SF2")
            .then((buffer) => SoundBankLoader.fromArrayBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)));
    }
    return soundBankPromise;
}
export async function midiToWav(midiBuffer, signal) {
    const midi = BasicMIDI.fromArrayBuffer(Uint8Array.from(midiBuffer).buffer);
    const soundBank = await getSoundBank();
    const synth = new SpessaSynthProcessor(SAMPLE_RATE, {
        eventsEnabled: false,
    });
    synth.soundBankManager.addSoundBank(soundBank, "main");
    await synth.processorInitialized;
    synth.setSystemParameter("autoAllocateVoices", true);
    const sequencer = new SpessaSynthSequencer(synth);
    sequencer.loadNewSongList([midi]);
    sequencer.play();
    const sampleCount = Math.ceil(SAMPLE_RATE * (midi.duration + 2));
    const left = new Float32Array(sampleCount);
    const right = new Float32Array(sampleCount);
    let renderedSamples = 0;
    while (renderedSamples < sampleCount) {
        if (signal?.aborted) {
            console.log("RENDER ABORTED");
            throw new Error("Render aborted");
        }
        sequencer.processTick();
        const chunkSize = Math.min(BUFFER_SIZE, sampleCount - renderedSamples);
        synth.process(left, right, renderedSamples, chunkSize);
        renderedSamples += chunkSize;
    }
    const wav = audioToWav([left, right], SAMPLE_RATE);
    return Buffer.from(wav);
}
//# sourceMappingURL=convertMidiToWav.js.map