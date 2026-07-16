import { useCallback, useEffect, useState } from 'react';

/**
 * Хук для управления панелью комментариев.
 * @param {string} targetType – тип сущности ('posts', 'tracks', 'videos', 'photos')
 * @param {any[]} [resetDeps=[]] – зависимости, при изменении которых панель закрывается (например, фильтр, страница пагинации)
 * @returns {{ commentTarget, handleCloseComments, onToggleComments }}
 */
export function useCommentsPanel(targetType, ...resetDeps) {
  const [commentTarget, setCommentTarget] = useState(null);

  // Открыть панель комментариев
  const handleOpenComments = useCallback((type, id) => {
    setCommentTarget((prev) =>
      prev?.type === type && prev?.id === id ? null : { type, id }
    );
  }, []);

  // Закрыть панель комментариев
  const handleCloseComments = useCallback(() => {
    if (!commentTarget) return;
    setCommentTarget(null);
  }, [commentTarget]);

  // Колбэк для передачи в карточки для открытия панели комментариев
  const onToggleComments = useCallback(
    (id) => handleOpenComments(targetType, id),
    [targetType, handleOpenComments]
  );

  /** Ключ для сброса панели комментариев */
  const resetKey = resetDeps.join(',');

  /** Сброс панели комментариев при изменении зависимостей */
  useEffect(() => {
    setCommentTarget(null);
  }, [resetKey]);

  return { commentTarget, handleCloseComments, onToggleComments };
}
