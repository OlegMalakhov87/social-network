/**
 * Преобразует треки из ответа сервера в формат для Track.
 *
 * @param {Object} raw - треки из ответа сервера
 * @param {number|null} currentUserId - ID текущего пользователя
 * @returns {Object} - нормализованные данные трека
 */

export const normalizeTrack = (raw, currentUserId) => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: null,
      title: '',
      artist: '',
      album: '',
      year: null,
      duration: null,
      fileUrl: '',
      genre: '',
      description: '',
      isInLibrary: false,
      libraryId: null,
      playsCount: 0,
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
    artist: raw.artist,
    album: raw.album,
    year: raw.year,
    duration: raw.duration,
    fileUrl: raw.fileUrl,
    genre: raw.genre,
    description: raw.description,
    isPublic: raw.isPublic,
    playsCount: raw.playsCount ?? 0,
    date: raw.updatedAt ?? raw.createdAt,
    libraryCreatedAt: raw.libraryCreatedAt,
    uploaderName: raw.uploader?.name,

    isInLibrary: raw.isInLibrary ?? false,
    isFavorite: raw.isFavorite ?? false,
    libraryId: raw.libraryId ?? null,
    profileLibraryId: raw.profileLibraryId ?? raw.libraryId ?? null,

    likesCount: raw.likes?.length ?? 0,
    isLiked: raw.likes?.some((like) => like.userId === currentUserId) ?? false,

    commentsCount: raw.commentsCount ?? raw.comments?.length ?? 0,
    comments: raw.comments || [],
  };
};
