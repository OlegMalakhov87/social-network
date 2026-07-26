import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostActions } from '..';
import { formatDate } from '../../../shared/lib';
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
import { normalizeSharedPost } from '../../shared-entity';

/**
 * Карточка поста.
 * @param {Object} props - параметры
 * @param {Object} props.post - данные поста
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {Object} props.targetUser - данные выбранного пользователя
 * @param {Function} props.onPlay - функция для воспроизведения видео поста
 * @param {Function} props.toggleLike - функция для лайка/дизлайка поста
 * @param {Function} props.onDelete - функция для удаления поста
 * @param {Function} props.onUpdate - функция для обновления поста
 * @param {Function} props.toggleComments - функция для открытия комментариев поста
 * @returns {JSX.Element} - компонент карточки поста
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
      sessionStorage.setItem(
        'sharedEntity',
        JSON.stringify(normalizeSharedPost(post))
      );
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
              subtitle={formatDate(post.updatedAt || post.createdAt)}
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
