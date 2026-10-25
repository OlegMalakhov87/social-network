/** Хранит ключи массивов ответа API. Порядок проверки важен. */
const LIST_KEYS = [
  'items',
  'users',
  'posts',
  'tracks',
  'videos',
  'news',
  'comments',
  'messages',
  'dialogs',
  'likes',
  'friends',
  'libraryItems',
];

/**
 * Извлекает элементы и сведения о страницах из ответа сервера.
 *
 * @param {Object|Array|null|undefined} data - Ответ сервера
 * @returns {{ items: Array, pagination: Object }} Элементы и сведения о страницах.
 */
export const extractPaginatedItems = (data) => {
  if (!data) {
    return { items: [], pagination: {} };
  }

  if (Array.isArray(data)) {
    return { items: data, pagination: {} };
  }

  for (const key of LIST_KEYS) {
    if (Array.isArray(data[key])) {
      return {
        items: data[key],
        pagination: data.pagination ?? {},
      };
    }
  }

  return { items: [], pagination: data.pagination ?? {} };
};
