import { useMemo } from 'react';
import { SORT_OPTIONS } from '../../config';
import { sortByData } from '../../lib';

/**
 * Нормализует и сортирует массив данных.
 *
 * @template T
 * @param {Object} params
 * @param {T[]} params.items - сырые данные с сервера
 * @param {string} params.entityType - тип сущности
 * @param {string} [params.sortKey] - ключ сортировки из SORT_OPTIONS
 * @param {Function} params.normalizeFn - функция нормализации одного элемента
 * @param {*} [params.userId] - ID текущего пользователя
 * @returns {T[]} - нормализованный и отсортированный массив
 */

export const useNormalizedData = ({
  items,
  entityType,
  sortKey,
  normalizeFn,
  userId,
}) => {
  return useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];

    // Нормализация
    const normalized = items.map((item) => normalizeFn(item, userId));

    // Сортировка
    const sortConfig = SORT_OPTIONS[sortKey];
    if (!sortConfig) return normalized;

    return sortByData(normalized, sortConfig, entityType);
  }, [items, entityType, sortKey, normalizeFn, userId]);
};
