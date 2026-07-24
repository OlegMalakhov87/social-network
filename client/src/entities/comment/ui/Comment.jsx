import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCommentActions } from '..';
import { formatTime } from '../../../shared/lib';
import {
  Avatar,
  Badge,
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
import { normalizeSharedComment } from '../../sharedEntity';
import style from './Comment.module.css';

/**
 * Карточка комментария.
 *
 * @param {Object} props
 * @param {Object} props.comment - данные комментария.
 * @param {Object} props.currentUserId - ID текущего пользователя.
 * @param {Object} props.author - данные автора комментария.
 * @param {Function} props.onEdit - функция для редактирования комментария.
 * @param {Function} props.onDelete - функция для удаления комментария.
 * @param {Function} props.toggleLike - функция для лайка комментария.
 * @returns {JSX.Element} - компонент карточки комментария.
 */

export const Comment = ({
  comment,
  currentUserId,
  author,
  onEdit,
  onDelete,
  toggleLike,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.content || '');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  if (!comment?.id || !author) return null;

  const actions = getCommentActions({
    comment,
    currentUserId,
    toggleLike,
    onDelete: () => setShowDeleteDialog(true),
    onEdit: () => setIsEditing(true),
    onShare: () => {
      sessionStorage.setItem(
        'sharedEntity',
        JSON.stringify(normalizeSharedComment(comment))
      );
      navigate('/messages');
    },
  });

  const handleSave = () => {
    if (editText.trim() && currentUserId) {
      onEdit?.(comment.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

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
                <Link
                  to={`/profile/${author.id}`}
                  aria-label={`Профиль ${author.name}`}
                >
                  <Avatar
                    src={author.photoUrl}
                    alt={author.name}
                    fallback="/user.png"
                  />
                </Link>
              }
              title={
                <Link to={`/profile/${author.id}`} className={style.authorName}>
                  {author.name}
                  {author.isVerified && (
                    <Badge variant="success" size="sm">
                      ✅
                    </Badge>
                  )}
                </Link>
              }
              subtitle={formatTime(comment.updatedAt || comment.createdAt)}
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
                <ButtonGroup align="end">
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
              <Text linkifyText={true}>{comment.content}</Text>
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
