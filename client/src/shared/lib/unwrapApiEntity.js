/**
 * Из ответа API возвращает вложенную сущность.
 * Если обёртки нет — возвращает data как есть.
 *
 * @param {Object} data - тело ответа
 * @param {string[]} [entityKeys] - ключи сущностей по приоритету
 * @returns {Object}
 */
export const unwrapApiEntity = (
  data,
  entityKeys = [
    'users',
    'posts',
    'news',
    'videos',
    'tracks',
    'likes',
    'comments',
    'messages',
  ]
) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  for (const key of entityKeys) {
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
