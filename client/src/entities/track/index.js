export * from './api/musicLibraryApi'; // API для библиотеки треков
export * from './api/musicApi'; // API для треков

export * from './model/tracksTabs'; // Мапа для выбора вкладки треков

export { getTrackActions } from './lib/getTrackActions'; // Функция для получения действий для трека
export { getTrackMeta } from './lib/getTrackMeta'; // Функция для получения метаданных для трека
export { normalizeTrack } from './lib/normalizeTrack'; // Функция для нормализации данных трека

export { Track } from './ui/Track'; // Компонент для отображения трека
export { TrackCover } from './ui/TrackCover'; // Компонент для отображения обложки трека
export { TrackMeta } from './ui/TrackMeta'; // Компонент для отображения метаданных трека
