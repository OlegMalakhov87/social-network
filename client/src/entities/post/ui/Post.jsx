import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostActions } from '..';
import { formatTime } from '../../../shared/lib';
import {
  BaseCard,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
  Text,
} from '../../../shared/ui';

/**
 * Карточка поста.
 * @param {Object} props
 * @param {Object} props.post - данные поста
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {Function} props.onPlay - клик по видео (воспроизвести)
 * @param {Function} props.toggleLike - колбэк лайка/дизлайка
 * @param {Function} props.onDelete - колбэк удаления
 * @param {Function} props.onUpdate - колбэк редактирования
 * @param {Function} props.toggleComments - колбэк открытия/закрытия комментариев (получает post.id)
 */
export const Post = ({
  post,
  currentUser,
  targetUser,
  onPlay,
  toggleLike,
  onDelete,
  onUpdate,
  toggleComments,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  if (!post?.id) return null;

  const actions = getPostActions({
    post,
    currentUser,
    toggleLike,
    toggleComments,
    onUpdate,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => {
      sessionStorage.setItem('sharedPostId', post.id);
      navigate('/messages');
    },
  });

  const handleConfirmDelete = () => {
    onDelete?.(post.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader>
            <EntityMeta
              avatar={targetUser?.photoUrl}
              title={targetUser?.name}
              subtitle={formatTime(post.updatedAt || post.createdAt)}
            />
          </EntityHeader>
        }
        content={
          <EntityContent>
            {post.mediaUrl && (
              <MediaPreview
                item={post}
                src={post.mediaUrl}
                alt={post.type === 'image' ? 'Фото' : 'Видео'}
                onClick={
                  post.type === 'video' ? () => onPlay?.(post) : undefined
                }
              />
            )}
            {post.text && <Text linkifyText={true}>{post.text}</Text>}
          </EntityContent>
        }
        actions={<EntityActions actions={actions} />}
      />
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить пост?"
        description="Это действие нельзя отменить. Пост будет удален навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
