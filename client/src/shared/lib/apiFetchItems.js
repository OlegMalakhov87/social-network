import { extractPaginatedItems } from './';

/**
 * Вспомогательная функция для запроса данных с пагинацией.
 *
 * @param {Function} fetchApi
 * @param {{ params: Object, signal?: AbortSignal }} options
 * @returns {Promise<{ items: Array, hasMore: boolean, currentPage: number }>}
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
