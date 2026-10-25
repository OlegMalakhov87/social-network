export * from './api/videoApi'; // Выполняет запросы видео.
export * from './api/videoLibraryApi'; // Выполняет запросы библиотеки видео.

export * from './model/videoSchema'; // Описывает схемы видео.
export * from './model/videosTabs'; // Хранит вкладки и категории видео.

export { getVideoActions } from './lib/getVideoActions'; // Возвращает действия видео.
export { getVideoMeta } from './lib/getVideoMeta'; // Возвращает сведения о видео.
export { getVideoStats } from './lib/getVideoStats'; // Возвращает статистику видео.
export { normalizeVideos } from './lib/normalizeVideos'; // Приводит видео к формату карточки.

export { Video } from './ui/Video'; // Отображает карточку видео.
export { VideoMeta } from './ui/VideoMeta'; // Отображает сведения о видео.
