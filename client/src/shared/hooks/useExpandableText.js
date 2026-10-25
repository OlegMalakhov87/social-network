import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Раскрывает обрезанный текст и проверяет переполнение.
 *
 * @param {Object} [params] - Параметры обрезки
 * @param {number} [params.lineClamp=2] - Число видимых строк
 * @param {Array} [params.deps=[]] - Зависимости пересчёта переполнения
 * @returns {{
 *   ref: import('react').RefObject,
 *   expanded: boolean,
 *   isOverflowing: boolean,
 *   toggle: Function
 * }} Ссылка на элемент, признак раскрытия, признак переполнения и переключатель.
 */
export const useExpandableText = ({ lineClamp = 2, deps = [] } = {}) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  /**
   * Проверяет, превышает ли текст видимую высоту.
   *
   * @returns {void}
   */
  const recalc = () => {
    const el = ref.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight + 1);
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    recalc();

    const observer = new ResizeObserver(recalc);
    observer.observe(el);

    return () => observer.disconnect();
  }, [lineClamp, deps]);

  /**
   * Переключает раскрытие текста.
   *
   * @returns {void}
   */
  const toggle = () => setExpanded((prev) => !prev);

  return { ref, expanded, isOverflowing, toggle };
};
