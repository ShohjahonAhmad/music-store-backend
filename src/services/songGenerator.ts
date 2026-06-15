import seedrandom from 'seedrandom';
import {fakerJA as faker} from "@faker-js/faker";
import type { Song } from '../types/Song.js';
import titles from "../data/es-ES/titles.json" with { type: "json" };
import artists from "../data/es-ES/artists.json" with { type: "json" };
import albums from "../data/es-ES/albums.json" with { type: "json" };
import genres from "../data/es-ES/genres.json" with { type: "json" };

const LIKE_SEED_OFFSET = 999999;
const PAGE_SIZE = 10;

function generateSong(songSeed: number, index: number): Song {
    faker.seed(songSeed);

    const rng = seedrandom(songSeed.toString());

    return {
        index,
        title: faker.music.songName(),

        artist: faker.music.artist(),

        album: rng() < 0.2 ? "Single" : faker.music.album(),

        genre: faker.music.genre(),

        likes: 0,
    }
}

export function generateSpanishSongs(seed: number, page: number, likesNumber: number): Song[]{
    const songs: Song[] = [];

    const startIndex = (page - 1) * PAGE_SIZE + 1;

    for(let i = 0; i < PAGE_SIZE; i++) {
        const index = startIndex + i;
        const songSeed = (seed * 1000) + index;
        const song = generateSpanishSong(`${songSeed}- ${index}`, index);
        song.likes = generateLikes(likesNumber, songSeed + LIKE_SEED_OFFSET);

        songs.push(song);
    }

    return songs;
}

export function generateSpanishSong(seed: string, index: number): Song {
    const titleRng = seedrandom(`${seed}-title`);
const artistRng = seedrandom(`${seed}-artist`);
const albumRng = seedrandom(`${seed}-album`);
const genreRng = seedrandom(`${seed}-genre`);

    return {
        index,
        title: titles[Math.floor(titleRng() * titles.length)]!,
        artist: artists[Math.floor(artistRng() * artists.length)]!,
        album: albums[Math.floor(albumRng() * albums.length)]!,
        genre: genres[Math.floor(genreRng() * genres.length)]!,
        likes: 0,
    }
}

export function generateSongs(seed: number, page: number, likesNumber: number): Song[] {
    const songs: Song[] = [];

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

function generateLikes(averageLikes: number, likesSeed: number): number{
    const rng = seedrandom(likesSeed.toString());

    const whole = Math.floor(averageLikes);
    const fraction = averageLikes - whole;

    if(rng() < fraction) {
        return whole + 1;
    } 

    return whole;
}