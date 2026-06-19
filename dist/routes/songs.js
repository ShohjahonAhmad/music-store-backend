import { Router } from 'express';
import { generateSongs } from '../services/songGenerator.js';
const router = Router();
router.get("/", (req, res) => {
    const seed = req.query.seed || '123';
    const page = req.query.page || '1';
    const likes = req.query.likes || '3.5';
    const locale = req.query.locale || 'en';
    const seedNumber = BigInt(seed);
    const pageNumber = parseInt(page);
    const likesNumber = parseFloat(likes);
    const songs = generateSongs(seedNumber, pageNumber, likesNumber, locale);
    res.json(songs);
});
export default router;
//# sourceMappingURL=songs.js.map