import { useCallback, useEffect, useState } from 'react';

/**
 * Хук для управления панелью комментариев.
 *
 * @param {string} targetType - тип сущности
 * @param {any[]} resetDeps - зависимости, при изменении которых панель закрывается
 * @returns {Object} - объект с данными о комментариях
 */
export const useCommentsPanel = (targetType, ...resetDeps) => {
  const [commentTarget, setCommentTarget] = useState(null);

  // Открыть панель комментариев
  const handleOpenComments = useCallback((type, id) => {
    setCommentTarget((prev) =>
      prev?.type === type && prev?.id === id ? null : { type, id }
    );
  }, []);

  // Закрыть панель комментариев
  const handleCloseComments = useCallback(() => {
    setCommentTarget(null);
  }, []);

  // Колбэк для передачи в карточки для открытия панели комментариев
  const onToggleComments = useCallback(
    (id) => handleOpenComments(targetType, id),
    [targetType, handleOpenComments]
  );

  /** Сброс панели комментариев при изменении зависимостей */
  useEffect(() => {
    setCommentTarget(null);
  }, [targetType, ...resetDeps]); // eslint-disable-line react-hooks/exhaustive-deps

  return { commentTarget, handleCloseComments, onToggleComments };
};
