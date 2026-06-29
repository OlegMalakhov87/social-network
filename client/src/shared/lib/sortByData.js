import { FIELD_MAP } from '../../config/sortConfig';

const TAB_TO_ENTITY = {
  Post: 'Post',
  Photo: 'Post',
  Track: 'Music',
  Video: 'Video',
  News: 'News',
};

/**
 * Сортирует массив сущностей по заданному полю и направлению.
 * @param {Array} items - исходный массив
 * @param {Object} sortConfig - { field: string, order: 'asc'|'desc' }
 * @param {string} entityType - тип сущности (Post, Music, Video, News)
 * @returns {Array} новый отсортированный массив
 */
export const sortByData = (items, sortConfig, entityType) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const { field, order } = sortConfig;
  if (!field || !order) return items;

  const mappedType = TAB_TO_ENTITY[entityType] || entityType;
  const fields = FIELD_MAP[mappedType];
  if (!fields) return items;

  // Определяем реальное поле в зависимости от типа сущности
  const targetField = field === 'date' ? fields.date : fields.views;

  return [...items].sort((a, b) => {
    const rawA = a[targetField];
    const rawB = b[targetField];

    let valA, valB;

    if (field === 'date') {
      valA = new Date(rawA || 0).getTime();
      valB = new Date(rawB || 0).getTime();
    } else {
      valA = Number(rawA) || 0;
      valB = Number(rawB) || 0;
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });
};
