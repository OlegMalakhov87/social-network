import { Button } from '../..';
import style from './Pagination.module.css';

/**
 * Пагинация (постраничная навигация).
 * @param {Object} props
 * @param {number} props.totalPages - общее количество страниц (целое число)
 * @param {number} props.page - текущая страница (начиная с 1) (целое число)
 * @param {Function} props.onPageChange - колбэк при смене страницы (получает номер страницы)
 */

export const Pagination = ({ totalPages, page, onPageChange }) => {
  // Защита от некорректных значений
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  const safePage = Math.min(Math.max(1, Number(page) || 1), safeTotal);

  /**
   * Генерация массива страниц с добавлением '...' для пропусков.
   * @returns {Array<number|string>}
   */
  const getPageNumbers = () => {
    if (safeTotal <= 7) {
      return Array.from({ length: safeTotal }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (safePage > 4) pages.push('...');

    const start = Math.max(2, safePage - 1);
    const end = Math.min(safeTotal - 1, safePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (safePage < safeTotal - 3) pages.push('...');

    pages.push(safeTotal);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className={style.pagination} aria-label="Пагинация">
      <Button
        variant="ghost"
        size="sm"
        className={style.pageButton}
        onClick={() => onPageChange(safePage - 1)}
        disabled={safePage === 1}
        aria-label="Предыдущая страница"
      >
        ←
      </Button>

      {pages.map((pageNum, idx) => {
        const isDots = pageNum === '...';
        const isActive = safePage === pageNum;

        return (
          <Button
            key={isDots ? `dots-${idx}` : pageNum}
            variant={isActive ? 'primary' : isDots ? 'ghost' : 'secondary'}
            size="sm"
            className={style.pageButton}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            disabled={isDots || isActive}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className={style.pageButton}
        onClick={() => onPageChange(safePage + 1)}
        disabled={safePage === safeTotal}
        aria-label="Следующая страница"
      >
        →
      </Button>
    </nav>
  );
};
