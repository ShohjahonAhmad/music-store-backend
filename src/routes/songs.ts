import {Router} from 'express';
import { generateSongs, generateWav } from '../services/songGenerator.js';

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

router.get("/audio", (req, res) => {
    const seed = (req.query.seed as string) || '123';
    const index = (req.query.index as string) || '1';
    const seedNumber = BigInt(seed);
    const songSeed = `${seedNumber}-${index}`;
    
    const wav = generateWav(songSeed);
    
    res.setHeader("Content-Type", "audio/wav");
    res.send(wav);
})

export default router;