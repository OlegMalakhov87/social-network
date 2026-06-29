import { useMemo, useEffect, useState } from 'react';

/**
 * Хук для пагинации массива данных.
 * @param {Array} items — массив элементов
 * @param {number} [itemsPerPage=12] — элементов на страницу
 * @param {number} [initialPage=1] — начальная страница
 */
export const usePagination = (items = [], itemsPerPage = 12, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(() => Math.max(1, Number(initialPage) || 1));

  // Сброс страницы при изменении данных
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, itemsPerPage]);

  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const goToPage = (page) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);

    // Откладываем скролл до завершения рендера
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  return {
    currentPage,
    paginatedItems,
    totalPages,
    goToPage,
    nextPage: () => goToPage(currentPage + 1),
    prevPage: () => goToPage(currentPage - 1),
  };
};
