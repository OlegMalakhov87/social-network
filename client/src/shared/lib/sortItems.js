import { FIELD_MAP } from '../config';

// Сопоставляет фотографии с полями постов.
const TAB_TO_ENTITY = {
  photos: 'posts',
};

/**
 * Сортирует элементы по полю и порядку.
 *
 * @param {Array} items - Элементы
 * @param {Object} sortConfig - Правило сортировки
 * @param {string} [sortConfig.field] - Поле сортировки
 * @param {string} [sortConfig.order] - Порядок сортировки
 * @param {string} entityType - Тип сущности
 * @returns {Array} Отсортированные элементы или исходный массив, если правило неполно.
 */
export const sortItems = (items, sortConfig, entityType) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  const { field, order } = sortConfig;
  if (!field || !order) return items;

  const mappedType = TAB_TO_ENTITY[entityType] ?? entityType;
  const fields = FIELD_MAP[mappedType];
  if (!fields) return items;

  const targetField = field === 'date' ? fields.date : fields.views;

  return [...items].sort((a, b) => {
    let valA, valB;

    if (field === 'date') {
      valA = new Date(a[targetField] || 0).getTime();
      valB = new Date(b[targetField] || 0).getTime();
    } else {
      valA = Number(a[targetField]) || 0;
      valB = Number(b[targetField]) || 0;
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });
};
