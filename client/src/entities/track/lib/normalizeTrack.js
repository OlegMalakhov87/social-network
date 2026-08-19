/**
 * Преобразует трек с сервера в формат компонента Track / AudioPlayer.
 * @param {Object} raw - трек из ответа сервера
 * @returns {Object} - нормализованные данные трека
 */
export const normalizeTrack = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: null,
      title: '',
      artist: '',
      album: '',
      year: null,
      duration: null,
      audio: '',
      cover: '',
      genre: '',
      description: '',
      isPublic: false,
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
    audio: raw.audio,
    cover: raw.cover,
    genre: raw.genre,
    description: raw.description,
    isPublic: raw.isPublic,
    playsCount: raw.playsCount ?? 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    date: raw.updatedAt ?? raw.createdAt,
    uploader: raw.uploader,

    isInLibrary: raw.isInLibrary ?? false,
    isFavorite: raw.isFavorite ?? false,
    libraryId: raw.libraryId ?? null,
    libraryCreatedAt: raw.libraryCreatedAt ?? null,
    profileLibraryId: raw.profileLibraryId ?? raw.libraryId ?? null,

    likesCount: raw.likesCount ?? 0,
    isLiked: raw.isLiked ?? false,

    commentsCount: raw.commentsCount ?? 0,
    comments: raw.comments || [],
  };
};
