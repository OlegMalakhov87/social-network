import { useState } from 'react';

import { getPostActions } from '..';
import { useExpandableText, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
  RichText,
  Text,
} from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';

import styles from './Post.module.css';

/**
 * Отображает карточку поста.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.post - Пост.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {Object} props.targetUser - Выбранный пользователь.
 * @param {Function} props.onShareEntity - Обработчик отправки поста.
 * @param {Function} props.onPlay - Обработчик воспроизведения.
 * @param {Function} props.toggleLike - Обработчик лайка.
 * @param {Function} props.onDelete - Обработчик удаления.
 * @param {Function} props.onUpdate - Обработчик обновления.
 * @param {Function} props.toggleComments - Обработчик комментариев.
 * @param {Object} props.currentPost - Текущий пост.
 * @param {boolean} props.isPlaying - Признак воспроизведения.
 * @returns {JSX.Element|null} Разметка карточки.
 */
export const Post = ({
  post,
  currentUser,
  targetUser,
  onShareEntity,
  onPlay,
  toggleLike,
  onDelete,
  onUpdate,
  toggleComments,
  currentPost,
  isPlaying,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  const notify = useNotify();

  const { ref, expanded, isOverflowing, toggle } = useExpandableText({
    lineClamp: 2,
  });

  if (!post?.id) return null;

  const actions = getPostActions({
    post,
    currentUser,
    toggleLike,
    toggleComments,
    onUpdate,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => onShareEntity(post),
  });

  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      setHasViewed(true);
    }
    toggle();
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete?.(post.id);
      setShowDeleteDialog(false);
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка удаления поста'));
    }
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
            {post.type !== 'text' && (
              <MediaPreview
                item={post}
                src={post.type === 'video' ? post.thumbnailUrl : post.postUrl}
                preview={post.type === 'video' ? post.previewUrl : null}
                alt={post.type === 'image' ? 'Фото' : 'Видео'}
                onClick={onPlay}
                currentItem={currentPost}
                isPlaying={isPlaying}
                className={styles.media}
                clickable={post.type === 'video' ? true : false}
                type={post.type === 'video' ? 'video' : 'image'}
                fallback={
                  post.type === 'video'
                    ? '/no-thumbnail-1200x720.png'
                    : '/no-image-1200x720.png'
                }
              />
            )}
            {!expanded && (
              <Text
                ref={ref}
                variant="body1"
                linkify={true}
                className={classNames(
                  styles.textPreview,
                  expanded && styles.hiddenPreview
                )}
              >
                {post.text}
              </Text>
            )}
            {expanded && (
              <RichText
                text={post.text}
                variant="body1"
                linkify={true}
                className={styles.textExpanded}
              />
            )}
            {isOverflowing && (
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
