import { useMemo } from 'react';

/**
 * Хук для нормализации массива данных.
 *
 * @param {Object} params
 * @param {Array} params.items - сырые данные с сервера
 * @param {Function} params.normalizeFn - функция нормализации одного элемента
 * @param {number|string} params.userId - ID текущего пользователя
 * @returns {Array} - нормализованный массив
 */
export const useNormalizedData = ({ items, normalizeFn, userId }) => {
  return useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];

    return items.map((item) => normalizeFn(item, userId));
  }, [items, normalizeFn, userId]);
};
