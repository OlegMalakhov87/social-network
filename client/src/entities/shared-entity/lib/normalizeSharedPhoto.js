/**
 * Нормализует объект фотографии в объект SharedEntityCard.
 *
 * @param {Object} photo - объект фотографии.
 * @returns {Object} - объект нормализованного фотографии.
 */
export const normalizeSharedPhoto = (photo) => ({
    id: photo.id,

    type: 'photo',

    author: photo.author||null,

    mediaUrl: photo.mediaUrl||null,

    title: photo.title||null,

    date: photo.date||null,

    stats: {
        likesCount: photo.likesCount ?? 0,
        commentsCount: photo.commentsCount ?? 0,
    },
});