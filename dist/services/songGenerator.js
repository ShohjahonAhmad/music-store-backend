import seedrandom from 'seedrandom';
import { faker } from "@faker-js/faker";
const LIKE_SEED_OFFSET = 999999;
const PAGE_SIZE = 10;
function generateSong(songSeed, index) {
    faker.seed(songSeed);
    const rng = seedrandom(songSeed.toString());
    return {
        index,
        title: faker.music.songName(),
        artist: rng() < 0.5 ? faker.music.artist() : faker.person.fullName(),
        album: rng() < 0.3 ? "Single" : faker.music.album(),
        genre: faker.music.genre(),
        likes: 0,
    };
}
export function generateSongs(seed, page, likesNumber) {
    const songs = [];
    const startIndex = (page - 1) * PAGE_SIZE + 1;
    for (let i = 0; i < PAGE_SIZE; i++) {
        const index = startIndex + i;
        const songSeed = (seed * 1000) + index;
        const song = generateSong(songSeed, index);
        song.likes = generateLikes(likesNumber, songSeed + LIKE_SEED_OFFSET);
        songs.push(song);
    }
    return songs;
}
function generateLikes(averageLikes, likesSeed) {
    const rng = seedrandom(likesSeed.toString());
    const whole = Math.floor(averageLikes);
    const fraction = averageLikes - whole;
    if (rng() < fraction) {
        return whole + 1;
    }
    return whole;
}
//# sourceMappingURL=songGenerator.js.map