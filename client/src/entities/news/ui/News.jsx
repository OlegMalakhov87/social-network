import { useState } from 'react';

import { CATEGORIES, getNewsActions } from '..';
import { useExpandableText, useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay } from '../../../shared/lib';
import {
  Badge,
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

import styles from './News.module.css';

/**
 * Отображает карточку новости.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.news - Новость.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {Function} props.onShareEntity - Обработчик отправки новости.
 * @param {Function} props.toggleLike - Обработчик лайка.
 * @param {Function} props.onReadMore - Обработчик чтения новости.
 * @param {Function} props.toggleComments - Обработчик комментариев.
 * @param {Function} props.onDelete - Обработчик удаления.
 * @param {Function} props.onUpdate - Обработчик обновления.
 * @param {Function} props.onPlay - Обработчик воспроизведения.
 * @param {Object} props.currentNews - Текущая новость.
 * @param {boolean} props.isPlaying - Признак воспроизведения.
 * @returns {JSX.Element|null} Разметка карточки.
 */

export const News = ({
  news,
  currentUser,
  onShareEntity,
  toggleLike,
  onReadMore,
  toggleComments,
  onDelete,
  onUpdate,
  onPlay,
  currentNews,
  isPlaying,
}) => {
  const [hasViewed, setHasViewed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const notify = useNotify();

  const { ref, expanded, isOverflowing, toggle } = useExpandableText({
    lineClamp: 2,
  });

  if (!news?.id) return null;

  const actions = getNewsActions({
    news,
    currentUser,
    toggleLike,
    toggleComments,
    onUpdate,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => onShareEntity(news),
  });

  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      onReadMore?.(news.id);
      setHasViewed(true);
    }
    toggle();
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete?.(news.id);
      setShowDeleteDialog(false);
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка удаления новости'));
    }
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader>
            <EntityMeta
              title={news.title}
              badge={
                <Badge size="sm" variant="primary">
                  {
                    CATEGORIES.find((category) => category.id === news.category)
                      ?.label
                  }
                </Badge>
              }
              subtitle={
                news.isEdited
                  ? `изм. ${formatDate(news.updatedAt)}`
                  : formatDate(news.publishedAt || news.createdAt)
              }
            />
          </EntityHeader>
        }
        cover={
          news.type !== 'text' && (
            <MediaPreview
              item={news}
              src={news.type === 'video' ? news.thumbnailUrl : news.newsUrl}
              preview={news.type === 'video' ? news.previewUrl : null}
              alt={news.type === 'image' ? 'Фото' : 'Видео'}
              type={news.type === 'video' ? 'video' : 'image'}
              onClick={onPlay}
              currentItem={currentNews}
              isPlaying={isPlaying}
              className={styles.media}
              clickable={news.type === 'video' ? true : false}
              fallback={
                news.type === 'video'
                  ? '/no-thumbnail-1280x720.png'
                  : '/no-image-1200x900.png'
              }
            />
          )
        }
        content={
          <EntityContent>
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
                {news.text}
              </Text>
            )}

            {expanded && (
              <RichText
                text={news.text}
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

            <EntityMeta
              avatar={news.uploader?.avatarUrl}
              title={news.uploader?.name}
              subtitle={news.source}
            />
          </EntityContent>
        }
        actions={<EntityActions actions={actions} />}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить новость?"
        description="Это действие нельзя отменить. Новость будет удалена навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
