//export { default as userVideosLibraryReducer } from './model/userVideosLibrarySlice';
//export { default as videosReducer } from './model/videosSlice';
//export * from './model/videoSelectors';
//export { addVideo, deleteVideo } from './model/videosSlice';
//export { addVideoToLibrary, removeVideoFromLibrary } from './model/userVideosLibrarySlice';

// API‑функции для библиотеки видео
export * from './api/videoLibraryApi';
// API‑функции для самого видео
export * from './api/videoApi';
// Мапа для выбора вкладки видео
export * from './model/videosTabs';
// Вспомогательные функции для видео (экшены)
export { getVideoActions } from './lib/getVideoActions';
// Вспомогательные функции для метаданных видео
export { getVideoMeta } from './lib/getVideoMeta';
// Вспомогательные функции для статистики видео
export { getVideoStats } from './lib/getVideoStats';
// Функция нормализации видео
export { normalizeVideo } from './lib/normalizeVideo';
// Компонент видео
export { Video } from './ui/Video';
export { VideoMeta } from './ui/VideoMeta';
export { VideoThumbnail } from './ui/VideoThumbnail';
