import { useCallback, useEffect, useState } from 'react';

/**
 * Открывает и закрывает панель комментариев.
 *
 * @param {string} targetType - Тип сущности
 * @param {...*} resetDeps - Значения, при смене которых панель закрывается
 * @returns {{
 *   commentTarget: {type: string, id: number|string}|null,
 *   handleCloseComments: Function,
 *   onToggleComments: Function
 * }} Цель панели и действия
 */
export const useCommentsPanel = (targetType, ...resetDeps) => {
  const [commentTarget, setCommentTarget] = useState(null);

  /**
   * Открывает панель или закрывает её при повторном выборе.
   *
   * @param {string} type - Тип сущности
   * @param {number|string} id - Идентификатор сущности
   * @returns {void}
   */
  const handleOpenComments = useCallback((type, id) => {
    setCommentTarget((prev) =>
      prev?.type === type && prev?.id === id ? null : { type, id }
    );
  }, []);

  const handleCloseComments = useCallback(() => {
    setCommentTarget(null);
  }, []);

  /**
   * Открывает панель для сущности выбранного типа.
   *
   * @param {number|string} id - Идентификатор сущности
   * @returns {void}
   */
  const onToggleComments = useCallback(
    (id) => handleOpenComments(targetType, id),
    [targetType, handleOpenComments]
  );

  // Закрывает панель при смене сущности или зависимостей.
  useEffect(() => {
    setCommentTarget(null);
  }, [targetType, ...resetDeps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { commentTarget, handleCloseComments, onToggleComments };
};
