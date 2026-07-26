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
  const { searchQuery, filter, ...restParams } = params;

  const data = await fetchApi({
    ...restParams,
    ...(filter?.trim() && { filter }),
    ...(searchQuery?.trim() && { q: searchQuery }),
    signal,
  });

  const items = Array.isArray(data?.items) ? data.items : [];

  return {
    items,
    hasMore: data?.pagination?.hasMore ?? false,
  };
};
