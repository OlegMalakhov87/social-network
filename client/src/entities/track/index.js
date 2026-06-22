//export { default as userMusicLibraryReducer } from './model/userMusicLibrarySlice';
//export { default as musicReducer } from './model/musicSlice';
//export * from './model/trackSelectors';
//export { addTrack, deleteTrack } from './model/musicSlice';
//export { addMusicToLibrary, removeMusicFromLibrary } from './model/userMusicLibrarySlice';

export { normalizeTrack } from './lib/normalizeTrack';
export { TrackCard } from './ui/TrackCard';

// API‑функции для библиотеки
export * from './api/musicLibraryApi';

// API‑функции для самого трека
export * from './api/musicApi';
