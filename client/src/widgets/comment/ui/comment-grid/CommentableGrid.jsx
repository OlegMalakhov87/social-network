import { useCallback, useRef } from 'react';

import { CommentsSection } from '../..';
import { useCommentsPanelInteraction } from '../../../../shared/hooks';

import styles from './CommentableGrid.module.css';

/**
 * Отображает сетку элементов с панелью комментариев.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.items=[]] - Элементы сетки
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onToggleComments - Обработчик открытия и закрытия комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Function} props.onCommentChange - Обработчик изменения комментариев
 * @param {Function} props.renderItem - Отрисовка элемента сетки
 * @returns {JSX.Element} Разметка сетки.
 */
export const CommentableGrid = ({
  items = [],
  commentTarget,
  onToggleComments,
  onCloseComments,
  currentUser,
  onCommentChange,
  renderItem,
}) => {
  const commentsRef = useRef(null);
  const itemRefs = useRef(new Map());

  // Возвращает элемент, к которому возвращается фокус после закрытия комментариев.
  const getReturnElement = useCallback(
    () => itemRefs.current.get(commentTarget?.id),
    [commentTarget?.id]
  );

  const { handleClose } = useCommentsPanelInteraction({
    isOpen: Boolean(commentTarget),
    onClose: onCloseComments,
    panelRef: commentsRef,
    getReturnElement,
  });

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <div
          key={item.id}
          ref={
            /**
             * Сохраняет узел элемента и удаляет его при размонтировании.
             *
             * @param {HTMLElement|null} node - Узел элемента сетки
             */
            (node) => {
              if (node) {
                itemRefs.current.set(item.id, node);
              } else {
                itemRefs.current.delete(item.id);
              }
            }
          }
        >
          {renderItem({
            item,
            onToggleComments,
          })}
        </div>
      ))}

      {commentTarget && (
        <div className={styles.commentsRow} ref={commentsRef}>
          <CommentsSection
            targetType={commentTarget.type}
            targetId={commentTarget.id}
            currentUser={currentUser}
            onClose={handleClose}
            onChange={onCommentChange}
          />
        </div>
      )}
    </div>
  );
};
