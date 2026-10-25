/**
 * Приводит трек с сервера к формату карточки.
 *
 * @param {Object} raw - Трек с сервера
 * @returns {Object} Трек карточки
 */
export const normalizeTracks = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return raw;
  }

  return {
    id: raw.id,
    uploadedBy: raw.uploadedBy,
    title: raw.title,
    artist: raw.artist,
    album: raw.album,
    size: raw.size,
    duration: raw.duration,
    audioUrl: raw.audioUrl,
    coverUrl: raw.coverUrl,
    category: raw.category,
    description: raw.description,
    isPublic: raw.isPublic ?? false,
    playsCount: raw.playsCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    uploader: raw.uploader,

    isInLibrary: raw.isInLibrary ?? false,
    isFavorite: raw.isFavorite ?? false,
    libraryId: raw.libraryId ?? null,
    libraryCreatedAt: raw.libraryCreatedAt ?? null,
    profileLibraryId: raw.profileLibraryId ?? raw.libraryId ?? null,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    commentsCount: raw.commentsCount ?? 0,
    comments: raw.comments ?? [],
  };
};
