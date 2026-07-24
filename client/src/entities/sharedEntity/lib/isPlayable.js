/**
 * Определяет, является ли сущность воспроизводимой (видео/аудио).
 *
 * @param {Object} entity - нормализованная сущность
 * @returns {boolean}
 */
export const isPlayable = (entity) => {
  if (!entity?.mediaUrl) return false;

  // Прямой тип сущности
  if (entity.type === 'video' || entity.type === 'track') return true;

  // Тип контента внутри сущности
  if (entity.mediaType === 'video') return true;

  return false;
};
