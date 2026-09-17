/** Ключи сущностей в типичных ответах API (порядок важен). */
const ENTITY_KEYS = [
  'item',
  'user',
  'post',
  'track',
  'video',
  'news',
  'comment',
  'message',
  'dialog',
  'like',
  'friend',
  'libraryItem',
];

/**
 * Из ответа API возвращает вложенную сущность.
 * Если обёртки нет — возвращает data как есть.
 *
 * @param {Object} data - тело ответа
 * @returns {Object} - вложенная сущность
 */
export const unwrapApiEntity = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  for (const key of ENTITY_KEYS) {
    const entity = data[key];
    if (
      entity != null &&
      typeof entity === 'object' &&
      !Array.isArray(entity)
    ) {
      return entity;
    }
  }

  return data;
};
