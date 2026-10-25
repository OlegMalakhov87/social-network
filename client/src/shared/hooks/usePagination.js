import { useEffect, useMemo, useState } from 'react';

/**
 * Делит массив на страницы.
 *
 * @param {Object} params - Параметры постраничного вывода
 * @param {Array} params.items - Элементы
 * @param {number} params.itemsPerPage - Число элементов на странице
 * @param {number} [params.initialPage=1] - Начальная страница
 * @returns {{
 *   currentPage: number,
 *   paginatedItems: Array,
 *   totalPages: number,
 *   goToPage: Function,
 *   nextPage: Function,
 *   prevPage: Function
 * }} Текущая страница, элементы и переходы.
 */
export const usePagination = ({ items, itemsPerPage, initialPage = 1 }) => {
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Number(initialPage) || 1)
  );

  // Сбрасывает страницу при изменении данных.
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

  /**
   * Переходит на страницу и прокручивает окно вверх.
   *
   * @param {number} page - Номер страницы
   * @returns {void}
   */
  const goToPage = (page) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(safePage);

    // Откладывает прокрутку до завершения отрисовки.
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  return {
    currentPage,
    paginatedItems,
    totalPages,
    goToPage,
    /**
     * Переходит на следующую страницу.
     *
     * @returns {void}
     */
    nextPage: () => goToPage(currentPage + 1),
    /**
     * Переходит на предыдущую страницу.
     *
     * @returns {void}
     */
    prevPage: () => goToPage(currentPage - 1),
  };
};
