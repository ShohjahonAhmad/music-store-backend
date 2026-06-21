import {Router} from 'express';
import { generateSongs } from '../services/songGenerator.js';
import { generateMidi } from '../services/music-generation/generateMidi.js';
import { midiToWav } from '../services/music-generation/convertMidiToWav.js';

const activeRenders = new Map<string, Promise<Buffer>>();

const router = Router();

router.get("/", (req, res) => {
    const seed = (req.query.seed as string) || '123';
    const page = (req.query.page as string) || '1';
    const likes = (req.query.likes as string) || '3.5';
    const locale = (req.query.locale as string) || 'en';
    const seedNumber = BigInt(seed);
    const pageNumber = parseInt(page);
    const likesNumber = parseFloat(likes);

    const songs = generateSongs(seedNumber, pageNumber, likesNumber, locale);

    res.json(songs);
})

router.get("/audio", async (req, res, next) => {
    const controller = new AbortController();
  
    req.on("close", () => {
      console.log("CLIENT DISCONNECTED");
      controller.abort();
    });
  
    try {
      const seed = (req.query.seed as string) || "123";
      const index = (req.query.index as string) || "1";
      const songSeed = `${BigInt(seed)}-${index}`;
      const key = `${seed}-${index}`;

      let render = activeRenders.get(key);

      if (!render) {
        const midi = generateMidi(songSeed);
        render = midiToWav(midi, controller.signal);
      
        activeRenders.set(key, render);
      
        render.finally(() => {
          activeRenders.delete(key);
        });
      }

      const wav = await Promise.race([
        render,
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error("aborted"));
          });
        }),
      ]);
  
      if (controller.signal.aborted) {
        return;
      }
  
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
      res.setHeader("ETag", songSeed);
  
      res.send(wav);
    } catch (err) {
      if (controller.signal.aborted) {
        return;
      }
  
      next(err);
    }
  });

export default router;