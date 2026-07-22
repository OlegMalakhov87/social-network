import { useEffect, useMemo, useState } from 'react';

/**
 * Хук для пагинации массива данных.
 *
 * @param {Object} params - параметры запроса
 * @param {Array} params.items - массив элементов
 * @param {number} params.itemsPerPage - элементов на страницу
 * @param {number} [params.initialPage=1] - начальная страница
 * @returns {Object} - { currentPage, paginatedItems, totalPages, goToPage, nextPage, prevPage }
 */
export const usePagination = ({ items, itemsPerPage, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(initialPage) || 1)
  );

  // Сброс страницы при изменении данных
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, itemsPerPage]);

  /** Общее количество страниц */
  const totalPages = useMemo(
    () => Math.ceil(items.length / itemsPerPage),
    [items.length, itemsPerPage]
  );

  /** Элементы на текущей странице */
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  /** Переход к конкретной странице */
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
