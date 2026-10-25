export * from './api/musicApi'; // Выполняет запросы треков.
export * from './api/musicLibraryApi'; // Выполняет запросы библиотеки треков.

export * from './model/trackSchema'; // Описывает схемы трека.
export * from './model/tracksTabs'; // Хранит вкладки и жанры треков.

export { getTrackActions } from './lib/getTrackActions'; // Возвращает действия трека.
export { getTrackMeta } from './lib/getTrackMeta'; // Возвращает сведения о треке.
export { normalizeTracks } from './lib/normalizeTracks'; // Приводит трек к формату карточки.

export { Track } from './ui/Track'; // Отображает карточку трека.

export { TrackMeta } from './ui/TrackMeta'; // Отображает сведения о треке.
