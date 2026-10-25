import { useCallback, useRef } from 'react';

import { CommentsSection } from '../..';
import { useCommentsPanelInteraction } from '../../../../shared/hooks';

import styles from './EntityWithComments.module.css';

/**
 * Отображает сущность вместе с панелью комментариев.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} props.entity - Комментируемая сущность
 * @param {string} props.targetType - Тип сущности
 * @param {Function} props.renderEntity - Отрисовка сущности
 * @param {boolean} props.isOpen - Признак открытой панели комментариев
 * @param {Function} props.onClose - Обработчик закрытия панели комментариев
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Function} props.onCommentChange - Обработчик изменения комментариев
 * @returns {JSX.Element} Разметка сущности.
 */
export const EntityWithComments = ({
  entity,
  targetType,
  isOpen,
  onClose,
  currentUser,
  onCommentChange,
  renderEntity,
}) => {
  const entityRef = useRef(null);
  const commentsRef = useRef(null);

  // Возвращает сущность, к которой возвращается фокус после закрытия комментариев.
  const getReturnElement = useCallback(() => entityRef.current, []);

  const { handleClose } = useCommentsPanelInteraction({
    isOpen,
    onClose,
    panelRef: commentsRef,
    getReturnElement,
  });

  return (
    <div ref={entityRef}>
      {renderEntity(entity)}

      {isOpen && (
        <div ref={commentsRef} className={styles.commentsSection}>
          <CommentsSection
            targetType={targetType}
            targetId={entity.id}
            currentUser={currentUser}
            onChange={onCommentChange}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
};
