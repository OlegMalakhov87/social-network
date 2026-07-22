/**
 * Преобразует видео из ответа сервера в формат для VideoCard.
 *
 * @param {Object} raw - видео из ответа сервера
 * @param {number|null} currentUserId - ID текущего пользователя
 * @returns {Object} - нормализованные данные видео
 */

export const normalizeVideo = (raw, currentUserId) => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: null,
      title: '',
      description: '',
      duration: null,
      size: null,
      year: null,
      videoUrl: '',
      thumbnailUrl: '',
      category: '',
      isInLibrary: false,
      libraryId: null,
      viewCount: 0,
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      comments: [],
    };
  }

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    description: raw.description,
    duration: raw.duration,
    size: raw.size,
    year: raw.year,
    videoUrl: raw.videoUrl,
    thumbnailUrl: raw.thumbnailUrl,
    category: raw.category,
    isPublic: raw.isPublic,
    viewCount: raw.viewCount ?? 0,
    createdAt: raw.createdAt,
    libraryCreatedAt: raw.libraryCreatedAt,
    uploaderName: raw.uploader?.name,

    isInLibrary: raw.isInLibrary ?? false,
    isFavorite: raw.isFavorite ?? false,
    libraryId: raw.libraryId ?? null,
    lastWatchedAt: raw.lastWatchedAt ?? null,
    profileLibraryId: raw.profileLibraryId ?? raw.libraryId ?? null,

    likesCount: raw.likes?.length ?? 0,
    isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

    commentsCount: raw.commentsCount ?? raw.comments?.length ?? 0,
    comments: raw.comments || [],
  };
};
