import { useState, useCallback, useEffect } from 'react';

/**
 * Хук для управления панелью комментариев.
 * @param {string} targetType – тип сущности ('Post', 'Music', 'Video', 'News')
 * @param {any[]} [resetDeps=[]] – зависимости, при изменении которых панель закрывается (например, фильтр, страница пагинации)
 * @returns {{ commentTarget, handleCloseComments, onToggleComments }}
 */
export function useCommentsPanel(targetType, ...resetDeps) {
  const [commentTarget, setCommentTarget] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Открыть/закрыть комментарии
  const handleOpenComments = useCallback((type, id) => {
    setScrollPosition(window.scrollY);
    setCommentTarget((prev) => (prev?.type === type && prev?.id === id ? null : { type, id }));
    setTimeout(() => {
      const commentsBlock = document.getElementById('comments-section');
      if (commentsBlock) {
        commentsBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }, []);

  // Закрыть панель
  const handleCloseComments = useCallback(() => {
    setCommentTarget(null);
    window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  }, [scrollPosition]);

  // Колбэк для передачи в карточки
  const onToggleComments = useCallback(
    (id) => handleOpenComments(targetType, id),
    [targetType, handleOpenComments]
  );

  // Сброс при изменении зависимостей
  useEffect(() => {
    setCommentTarget(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return { commentTarget, handleCloseComments, onToggleComments };
}
