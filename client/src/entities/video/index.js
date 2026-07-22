export * from './api/videoApi'; // API‑функции видео
export * from './api/videoLibraryApi'; // API‑функции библиотеки видео

export * from './model/videosTabs'; // Мапа для выбора вкладки видео

export { getVideoActions } from './lib/getVideoActions'; // Функция для получения действий для видео
export { getVideoMeta } from './lib/getVideoMeta'; // Функция для получения метаданных для видео
export { getVideoStats } from './lib/getVideoStats'; // Функция для получения статистики для видео
export { normalizeVideo } from './lib/normalizeVideo'; // Функция для нормализации данных видео

export { Video } from './ui/Video'; // Компонент для отображения видео
export { VideoMeta } from './ui/VideoMeta'; // Компонент для отображения метаданных видео
export { VideoThumbnail } from './ui/VideoThumbnail'; // Компонент для отображения обложки видео
