import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Хук для работы с раскрываемым текстом
 *
 * @param {number} lineClamp - Количество строк, на которые нужно обрезать текст
 * @param {Array} [deps=[]] - Зависимости для recalc функции
 * @returns {Object} - Объект с ref, expanded, isOverflowing и toggle функциями
 */
export const useExpandableText = ({ lineClamp = 2, deps = [] } = {}) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

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

  const toggle = () => setExpanded((prev) => !prev);

  return { ref, expanded, isOverflowing, toggle };
};
