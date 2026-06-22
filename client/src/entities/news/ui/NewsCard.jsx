import { useState } from 'react';
import style from './NewsCard.module.css';
import { formatTime, formatViews, ImageWithFallback } from '../../../shared/lib';

/**
 * Карточка новости.
 * @param {Object} props
 * @param {Object} props.news - новость
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.onToggleLike - лайк/дизлайк
 * @param {Function} props.onReadMore - увеличение счетчика просмотров
 * @param {Function} props.onDelete - удалить новость
 * @param {Function} props.toggleComments - открыть комментарии
 * @param {string|null} props.error - ошибка
 */
export const NewsCard = ({
  news,
  currentUser,
  onToggleLike,
  onReadMore,
  toggleComments,
  onDelete,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  if (!news?.id) return null;

  /** Не реализовано */
  const isAdmin = currentUser?.isAdmin;
  const isAuthor = currentUser?.id === news.uploadedBy;
  const canDelete = isAdmin || isAuthor;

  /** Развернуть/свернуть контент*/
  const handleToggleExpand = (e) => {
    e?.stopPropagation();
    if (!expanded && !hasViewed) {
      onReadMore?.(news.id);
      setHasViewed(true);
    }
    setExpanded((prev) => !prev);
  };

  return (
    //  Не реализовано
    <div className={style.newsCard}>
      {canDelete && (
        <button
          className={style.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(news.id);
          }}
          aria-label="Удалить новость"
        >
          ✕
        </button>
      )}

      {news.imageUrl && (
        <ImageWithFallback
          className={style.image}
          src={news.imageUrl}
          alt="Изображение"
          fallback="/support.png"
        />
      )}

      <div className={style.body}>
        <div className={style.meta}>
          <span className={style.category}>{news.category}</span>
          <span className={style.date}>{formatTime(news.date)}</span>
        </div>

        <h3 className={style.title}>{news.title}</h3>
        <p className={`${style.text} ${expanded ? style.expanded : ''}`}>{news.content}</p>

        {news.content && news.content.length > 50 && (
          <button
            className={style.expandButton}
            onClick={(e) => {
              e?.stopPropagation();
              handleToggleExpand();
            }}
          >
            {expanded ? 'Свернуть' : 'Читать далее'}
          </button>
        )}

        <div className={style.footer}>
          <div className={style.author}>
            <ImageWithFallback
              className={style.authorAvatar}
              src={`https://i.pravatar.cc/32?u=${news.author || 'anon'}`}
              alt="Автор"
              fallback="/support.png"
            />
            <span className={style.authorName}>{news.author || 'Редакция'}</span>
            {news.source && <span className={style.source}>· {news.source}</span>}
          </div>

          <div className={style.actions}>
            <button
              className={`${style.actionButton} ${news.isLiked ? style.liked : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                news.isLiked ? onToggleLike?.(news.id, true) : onToggleLike?.(news.id, false);
              }}
              aria-label={news.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
            >
              {news.isLiked ? '❤️' : '🤍'} {news.likesCount}
            </button>
            <button
              className={style.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                toggleComments?.(news.id);
              }}
            >
              {news.commentsCount} 💬 Комментировать
            </button>
            <span className={style.views}>👁️ {formatViews(news.viewCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
