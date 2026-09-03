/**
 * Преобразует видео Videos с сервера в формат компонента Video / VideoPlayer.
 * @param {Object} raw - видео из ответа сервера
 * @returns {Object} - нормализованные данные видео
 */
export const normalizeVideo = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    description: raw.description,
    duration: raw.duration,
    size: raw.size,
    year: raw.year,
    videoUrl: raw.videoUrl,
    previewUrl: raw.previewUrl,
    thumbnailUrl: raw.thumbnailUrl,
    category: raw.category,
    isPublic: raw.isPublic,
    viewsCount: raw.viewsCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    uploader: raw.uploader,

    isInLibrary: raw.isInLibrary ?? false,
    isFavorite: raw.isFavorite ?? false,
    libraryId: raw.libraryId ?? null,
    libraryCreatedAt: raw.libraryCreatedAt ?? null,
    lastWatchedAt: raw.lastWatchedAt ?? null,
    profileLibraryId: raw.profileLibraryId ?? null,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    commentsCount: raw.commentsCount ?? 0,
    comments: raw.comments || [],
  };
};
