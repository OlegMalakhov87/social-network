/**
 * Вспомогательная функция для запроса данных с пагинацией.
 * Все fetch-функции должны возвращать { items, pagination }.
 *
 * @param {Function} fetchApi - функция для запроса данных (принимает { page, limit, ...params, signal })
 * @param {Object} params - дополнительные параметры (filter, searchQuery, etc.)
 * @param {AbortSignal} signal - сигнал отмены запроса
 * @returns {Promise<Object>} - объект с данными
 */

export const apiFetchItems = async (fetchApi, { params, signal }) => {
  const data = await fetchApi({
    ...params,
    filter: params.filter?.trim() ? params.filter : undefined,
    q: params.searchQuery?.trim() ? params.searchQuery : undefined,
    page: params.page,
    limit: params.limit,
    signal,
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  const itemsWithCount = items.map((item) => ({
    ...item,
    commentsCount: item.comments?.length ?? 0,
  }));
  return {
    items: itemsWithCount,
    hasMore: data?.pagination?.hasMore ?? false,
  };
};
