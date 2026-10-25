/**
 * Проверяет, можно ли воспроизвести сущность.
 *
 * @param {Object} entity - Сущность с адресом медиа
 * @returns {boolean} Признак воспроизводимости видео или аудио с адресом.
 */
export const isPlayable = (entity) => {
  if (!entity?.mediaUrl) return false;

  // Считает видео и аудиотрек воспроизводимыми по типу сущности.
  if (entity.type === 'video' || entity.type === 'track') return true;

  // Считает видео воспроизводимым по типу содержимого.
  if (entity.mediaType === 'video') return true;

  return false;
};
