import { useMemo } from 'react';

/**
 * Возвращает нормализованный массив данных.
 *
 * @param {Object} params - Параметры нормализации
 * @param {Array} params.items - Исходные элементы
 * @param {Function} params.normalizeFn - Нормализует один элемент
 * @param {number|string|null} [params.userId=null] - Идентификатор текущего пользователя
 * @returns {Array} Нормализованные элементы.
 */
export const useNormalizedData = ({ items, normalizeFn, userId = null }) => {
  return useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map((item) => normalizeFn(item, userId));
  }, [items, normalizeFn, userId]);
};
