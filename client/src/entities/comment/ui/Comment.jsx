import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCommentActions } from '..';
import {
  Avatar,
  BaseCard,
  Button,
  ButtonGroup,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  Text,
  TextArea,
} from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';
import styles from './Comment.module.css';

/**
 * Карточка комментария.
 *
 * @param {Object} props
 * @param {Object} props.comment - данные комментария.
 * @param {Object} props.currentUserId - ID текущего пользователя.
 * @param {Function} props.onShareEntity - функция для расшаривания комментария.
 * @param {Object} props.author - данные автора комментария.
 * @param {Function} props.onEdit - функция для редактирования комментария.
 * @param {Function} props.onDelete - функция для удаления комментария.
 * @param {Function} props.toggleLike - функция для лайка/дизлайка комментария.
 * @returns {JSX.Element} - компонент карточки комментария.
 */

export const Comment = ({
  comment,
  currentUserId,
  onShareEntity,
  author,
  onEdit,
  onDelete,
  toggleLike,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.text || '');
  const [expanded, setExpanded] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  if (!comment?.id || !author) return null;

  /** Конфигурация элементов управления карточкой комментария. */
  const actions = getCommentActions({
    comment,
    currentUserId,
    toggleLike,
    onDelete: () => setShowDeleteDialog(true),
    onEdit: () => setIsEditing(true),
    onShare: () => {
      onShareEntity(comment);
    },
  });

  /** Обработчик сохранения изменений в комментарии. */
  const handleSave = () => {
    if (editText.trim() && currentUserId) {
      onEdit?.(comment.id, { text: editText, isEdited: true });
      setIsEditing(false);
    }
  };

  /** Обработчик отмены изменений в комментарии. */
  const handleCancel = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  /** Обработчик переключения раскрытия текста комментария. */
  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      setHasViewed(true);
    }
    setExpanded((prev) => !prev);
  };

  /** Обработчик подтверждения удаления комментария. */
  const handleConfirmDelete = () => {
    onDelete?.(comment.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader>
            <EntityMeta
              avatar={
                <Avatar
                  src={author.avatarUrl}
                  alt={author.name}
                  status={author.online ? 'online' : 'offline'}
                  clickable={true}
                  onClick={() => navigate(`/profile/${author.id}`)}
                />
              }
              title={
                <Link
                  to={`/profile/${author.id}`}
                  className={styles.authorName}
                >
                  {author.name}
                </Link>
              }
              subtitle={
                comment.isEdited
                  ? `изм. ${formatDate(comment.updatedAt)}`
                  : formatDate(comment.createdAt)
              }
            />
          </EntityHeader>
        }
        content={
          <EntityContent>
            {isEditing ? (
              <>
                <TextArea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  rows={3}
                />
                <ButtonGroup>
                  <Button variant="secondary" size="sm" onClick={handleCancel}>
                    Отмена
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!editText.trim()}
                  >
                    Сохранить
                  </Button>
                </ButtonGroup>
              </>
            ) : (
              <>
                <Text
                  linkify={true}
                  className={classNames(
                    styles.text,
                    expanded && styles.expanded
                  )}
                >
                  {comment.text}
                </Text>
                {comment.text && comment.text.length > 80 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleExpand}
                  >
                    {expanded ? 'Свернуть' : 'Читать далее'}
                  </Button>
                )}
              </>
            )}
          </EntityContent>
        }
        actions={!isEditing && <EntityActions actions={actions} />}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить комментарий?"
        description="Это действие нельзя отменить. Комментарий будет удалён навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
