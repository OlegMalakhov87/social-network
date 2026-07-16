//export { default as userMusicLibraryReducer } from './model/userMusicLibrarySlice';
//export { default as musicReducer } from './model/musicSlice';
//export * from './model/trackSelectors';
//export { addTrack, deleteTrack } from './model/musicSlice';
//export { addMusicToLibrary, removeMusicFromLibrary } from './model/userMusicLibrarySlice';

// API‑функции для библиотеки пользователя
export * from './api/musicLibraryApi';
// API‑функции для страницы треков
export * from './api/musicApi';

// Вспомогательные функции для треков (экшены)
export { getTrackActions } from './lib/getTrackActions';

// Вспомогательные функции для метаданных треков
export { getTrackMeta } from './lib/getTrackMeta';
export { normalizeTrack } from './lib/normalizeTrack';

// Компоненты треков
export { Track } from './ui/Track';
export { TrackCover } from './ui/TrackCover';
export { TrackMeta } from './ui/TrackMeta';
