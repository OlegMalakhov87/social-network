/** Хранит ключи вложенной сущности в ответе API. Порядок проверки важен. */
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
 * Возвращает вложенную сущность из ответа API.
 *
 * @param {*} data - Тело ответа
 * @returns {*} Вложенную сущность или исходные данные, если обёртки нет.
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
