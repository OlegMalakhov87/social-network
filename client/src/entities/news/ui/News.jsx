import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNewsActions } from '..';
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
import { normalizeSharedNews } from '../../shared-entity';
import style from './News.module.css';

/**
 * Компонент для отображения карточки новости.
 *
 * @param {Object} props - параметры
 * @param {Object} props.news - данные новости
 * @param {Object} props.currentUser - данные текущего пользователя
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
  const navigate = useNavigate();
  if (!news?.id) return null;

  const actions = getNewsActions({
    news,
    currentUser,
    toggleLike,
    toggleComments,
    onUpdate,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => {
      sessionStorage.setItem(
        'sharedEntity',
        JSON.stringify(normalizeSharedNews(news))
      );
      navigate('/messages');
    },
  });

  const handleToggleExpand = () => {
    if (!expanded && !hasViewed) {
      onReadMore?.(news.id);
      setHasViewed(true);
    }
    setExpanded((prev) => !prev);
  };

  const handleConfirmDelete = () => {
    onDelete?.(news.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader>
            <EntityMeta
              title={news.title}
              badge={news.category}
              subtitle={formatDate(news.updatedAt || news.createdAt)}
            />
          </EntityHeader>
        }
        cover={
          news.newsUrl && (
            <MediaPreview
              item={news}
              currentItem={currentNews}
              isPlaying={isPlaying}
              src={news.newsUrl}
              alt={news.title}
              onClick={onPlay}
            />
          )
        }
        content={
          <EntityContent>
            <Text
              linkify={true}
              className={classNames(style.text, expanded && style.expanded)}
            >
              {news.text}
            </Text>

            {news.text && news.text.length > 50 && (
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
