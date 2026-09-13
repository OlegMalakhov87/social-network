import { useCallback, useRef } from 'react';
import { useCommentsPanelInteraction } from '../../../shared/hooks';
import { CommentsSection } from '../../comments-list';
import styles from './CommentableGrid.module.css';

/**
 * Компонент для отображения сетки с комментариями.
 *
 * @param {Object} props - Пропсы компонента.
 * @param {Function} props.renderItem - Функция для рендера элемента.
 * @param {Array} props.items - Массив элементов.
 * @param {Object} props.commentTarget - Объект цели комментария.
 * @param {Function} props.onToggleComments - Функция для открытия/закрытия комментариев.
 * @param {Function} props.onCloseComments - Функция для закрытия комментариев.
 * @param {Object} props.currentUser - Объект текущего пользователя.
 * @param {Function} props.onCommentChange - Функция для изменения комментария.
 * @returns {JSX.Element} Компонент сетки с комментариями.
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

  /**
   * Функция для получения элемента, на который нужно вернуться после закрытия панели комментариев.
   */
  const getReturnElement = useCallback(
    () => itemRefs.current.get(commentTarget?.id),
    [commentTarget?.id]
  );

  /**
   * Хук для взаимодействия с панелью комментариев.
   */
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
          ref={(node) => {
            if (node) {
              itemRefs.current.set(item.id, node);
            } else {
              itemRefs.current.delete(item.id);
            }
          }}
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
