import { useCallback, useRef } from 'react';
import { CommentsSection } from '../comments-list';

/**
 * Компонент для отображения сущности с комментариями.
 *
 * @param {Object} props
 * @param {Object} props.entity - сущность.
 * @param {string} props.targetType - тип сущности.
 * @param {Function} props.renderEntity - функция для рендера сущности.
 * @param {boolean} props.isOpen - флаг открытия панели комментариев.
 * @param {Function} props.onClose - функция для закрытия панели комментариев.
 * @param {Object} props.currentUser - текущий пользователь.
 * @param {Function} props.onCommentChange - функция для изменения комментариев.
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

  const handleClose = useCallback(() => {
    onClose?.();

    requestAnimationFrame(() => {
      entityRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [onClose]);

  return (
    <div ref={entityRef}>
      {renderEntity(entity)}

      {isOpen && (
        <CommentsSection
          targetType={targetType}
          targetId={entity.id}
          currentUser={currentUser}
          onChange={onCommentChange}
          onClose={handleClose}
        />
      )}
    </div>
  );
};
