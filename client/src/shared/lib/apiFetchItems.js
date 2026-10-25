import { extractPaginatedItems } from './';

/**
 * Загружает страницу элементов и сообщает, есть ли следующая.
 *
 * @param {Function} fetchApi - Выполняет запрос к серверу
 * @param {Object} options - Параметры запроса
 * @param {Object} options.params - Параметры выборки
 * @param {AbortSignal} [options.signal] - Сигнал отмены
 * @returns {Promise<{ items: Array, hasMore: boolean }>} Элементы и признак следующей страницы.
 */
export const apiFetchItems = async (fetchApi, { params, signal }) => {
  const { q, filter, ...restParams } = params;

  const data = await fetchApi({
    ...restParams,
    ...(filter?.trim?.() && { filter }),
    ...(q?.trim?.() && { q }),
    signal,
  });

  const { items, pagination } = extractPaginatedItems(data);

  return {
    items,
    hasMore: pagination?.hasMore ?? false,
  };
};
