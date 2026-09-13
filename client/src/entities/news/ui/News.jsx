import { useState } from 'react';
import { getNewsActions } from '..';
import { useNotify } from '../../../shared/hooks';
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
  Text,
} from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';
import styles from './News.module.css';

/**
 * Компонент для отображения карточки новости.
 *
 * @param {Object} props - параметры
 * @param {Object} props.news - данные новости
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {Function} props.onShareEntity - функция для отображения расшаренной новости
 * @param {Function} props.toggleLike - функция для лайка/дизлайка новости
 * @param {Function} props.onReadMore - функция для чтения новости
 * @param {Function} props.toggleComments - функция для открытия комментариев новости
 * @param {Function} props.onDelete - функция для удаления новости
 * @param {Function} props.onUpdate - функция для обновления новости
 * @param {Function} props.onPlay - функция для воспроизведения видео новости
 * @param {Object} props.currentNews - текущая новость
 * @param {boolean} props.isPlaying - воспроизводится ли новость
 * @returns {JSX.Element} - компонент карточки новости
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
  const [expanded, setExpanded] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const notify = useNotify();

  if (!news?.id) return null;

  /** Конфигурация элементов управления карточкой новости. */
  const actions = getNewsActions({
    news,
    currentUser,
    toggleLike,
    toggleComments,
    onUpdate,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => onShareEntity(news),
  });

  /** Обработчик переключения раскрытия текста новости. */
  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      onReadMore?.(news.id);
      setHasViewed(true);
    }
    setExpanded((prev) => !prev);
  };

  /** Обработчик подтверждения удаления новости. */
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
              badge={news.category}
              subtitle={
                news.isEdited
                  ? `изм. ${formatDate(news.updatedAt)}`
                  : formatDate(news.createdAt)
              }
            />
          </EntityHeader>
        }
        cover={
          news.newsUrl && (
            <MediaPreview
              item={news}
              src={news.type === 'video' ? news.thumbnailUrl : news.newsUrl}
              preview={news.type === 'video' ? news.previewUrl : null}
              alt={news.type === 'image' ? 'Фото' : 'Видео'}
              onClick={onPlay}
              currentItem={currentNews}
              isPlaying={isPlaying}
              className={styles.media}
            />
          )
        }
        content={
          <EntityContent>
            <Text
              linkify={true}
              variant="body1"
              className={classNames(styles.text, expanded && styles.expanded)}
            >
              {news.text}
            </Text>

            {news.text && news.text.length > 75 && (
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
