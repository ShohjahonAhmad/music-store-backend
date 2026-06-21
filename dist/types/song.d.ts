export type Song = {
    index: number;
    title: string;
    artist: string;
    album: string;
    genre: string;
    likes: number;
    reviews: Review[];
};
export type Review = {
    author: string;
    content: string;
};
export type Note = {
    frequency: number;
    durationMs: number;
};
export type Music = {
    tempo: number;
    notes: Note[];
};
//# sourceMappingURL=Song.d.ts.map