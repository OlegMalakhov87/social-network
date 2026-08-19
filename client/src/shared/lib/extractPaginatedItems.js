/** Ключи массивов в типичных ответах API (порядок важен). */
const LIST_KEYS = [
  'items',
  'posts',
  'tracks',
  'videos',
  'news',
  'comments',
  'messages',
  'dialogs',
  'users',
];

/**
 * Достаёт массив элементов и pagination из ответа сервера.
 *
 * @param {Object|null|undefined} data
 * @returns {{ items: Array, pagination: Object }}
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
