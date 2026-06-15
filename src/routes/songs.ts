import {Router} from 'express';
import { generateSongs } from '../services/songGenerator.js';

const router = Router();

router.get("/", (req, res) => {
    const seed = (req.query.seed as string) || '123';
    const page = (req.query.page as string) || '1';
    const likes = (req.query.likes as string) || '3.5';
    const seedNumber = parseInt(seed);
    const pageNumber = parseInt(page);
    const likesNumber = parseFloat(likes);

    const songs = generateSongs(seedNumber, pageNumber, likesNumber);

    res.json(songs);
})

export default router;