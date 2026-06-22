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