import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPostActions } from '..';
import {
  BaseCard,
  Button,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
  Text,
} from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';
import { normalizeSharedPost } from '../../shared-entity';
import styles from './Post.module.css';
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
 * @param {Object} props.currentPost - текущий пост
 * @param {boolean} props.isPlaying - воспроизводится ли пост
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
  currentPost,
  isPlaying,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
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

  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      setHasViewed(true);
    }
    setExpanded((prev) => !prev);
  };

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
              avatar={post.author?.avatarUrl ?? targetUser?.avatarUrl}
              title={post.author?.name ?? targetUser?.name}
              subtitle={
                post.isEdited
                  ? `изм. ${formatDate(post.updatedAt)}`
                  : formatDate(post.createdAt)
              }
            />
          </EntityHeader>
        }
        content={
          <EntityContent>
            {post.postUrl && (
              <MediaPreview
                item={post}
                src={post.postUrl}
                alt={post.type === 'image' ? 'Фото' : 'Видео'}
                onClick={onPlay}
                currentItem={currentPost}
                isPlaying={isPlaying}
                className={styles.media}
              />
            )}
            <Text
              linkify={true}
              variant="h4"
              className={classNames(styles.text, expanded && styles.expanded)}
            >
              {post.text}
            </Text>
            {post.text && post.text.length > 75 && (
              <Button variant="ghost" size="sm" onClick={handleToggleExpand}>
                {expanded ? 'Свернуть' : 'Читать далее'}
              </Button>
            )}
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
