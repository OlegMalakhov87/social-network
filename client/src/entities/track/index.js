//export { default as userMusicLibraryReducer } from './model/userMusicLibrarySlice';
//export { default as musicReducer } from './model/musicSlice';
//export * from './model/trackSelectors';
//export { addTrack, deleteTrack } from './model/musicSlice';
//export { addMusicToLibrary, removeMusicFromLibrary } from './model/userMusicLibrarySlice';

// API‑функции для библиотеки
export * from './api/musicLibraryApi';
// API‑функции для самого трека
export * from './api/musicApi';

// Вспомогательные функции для треков
export { getTrackActions } from './lib/getTrackActions';
export { getTrackMeta } from './lib/getTrackMeta';
export { normalizeTrack } from './lib/normalizeTrack';

// Ui компоненты треков
export { Track } from './ui/Track';
export { TrackCover } from './ui/TrackCover';
export { TrackMeta } from './ui/TrackMeta';
