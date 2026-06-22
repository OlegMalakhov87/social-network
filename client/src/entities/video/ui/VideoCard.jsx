import style from './VideoCard.module.css';
import { ImageWithFallback, formatDuration, formatViews, formatTime } from '../../../shared/lib';

/**
 * Карточка одного видео.
 * @param {Object} props
 * @param {Object} props.video - объект видео
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwn - принадлежит ли видео текущему
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {Function} props.onPlay - клик по видео (воспроизвести)
 * @param {Function} props.onDelete - удалить видео
 * @param {Function} props.addToLibrary - добавить в библиотеку
 * @param {Function} props.removeFromLibrary - удалить из библиотеки
 * @param {Function} props.updateViewCount - обновить личный счетчик просмотров
 * @param {Function} props.updateGlobalViewCount - обновить глобальный счетчик просмотров
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.toggleFavorite - добавит/удалить из избранного
 * @param {Function} props.toggleComments - открыть комментарии
 */
export const VideoCard = ({
  video,
  currentUser,
  isOwn,
  isProfileOwner,
  mode,
  onPlay,
  onDelete,
  addToLibrary,
  removeFromLibrary,
  updateViewCount,
  updateGlobalViewCount,
  toggleLike,
  toggleFavorite,
  toggleComments,
}) => {
  if (!video?.id) return null;

  const showFavorite = mode === 'profile' && isProfileOwner && video.isInLibrary;
  const isProfileMode = mode === 'profile';

  const handlePlayClick = () => {
    if (video.profileLibraryId) {
      const newCount = (video.viewCount ?? 0) + 1;
      updateViewCount?.(video.id, video.profileLibraryId, video.isFavorite, newCount);
    } else {
      updateGlobalViewCount?.(video.id);
    }
    onPlay?.(video);
  };

  return (
    <div className={style.videoCard}>
      {showFavorite && (
        <button
          className={style.favoriteButton}
          onClick={(e) => {
            e?.stopPropagation();
            toggleFavorite?.(
              video.id,
              video.libraryId,
              video.isFavorite,
              video.watchCount,
              video.lastWatched
            );
          }}
          aria-label={video.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {video.isFavorite ? '⭐' : '☆'}
        </button>
      )}

      {isOwn && (
        <button
          className={style.deleteVideoButton}
          onClick={(e) => {
            e?.stopPropagation();
            onDelete?.(video.id);
          }}
          aria-label="Удалить видео"
        >
          ✕
        </button>
      )}

      <div
        className={style.videoPreview}
        onClick={(e) => {
          e?.stopPropagation();
          handlePlayClick?.();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e?.preventDefault();
            handlePlayClick?.();
          }
        }}
        aria-label="Воспроизвести видео"
      >
        <ImageWithFallback src={video.thumbnailUrl} alt="Обложка" fallback="/error.png" />
        <span className={style.videoDuration}>{formatDuration(video.duration)}</span>

        <span className={style.playOverlay} aria-hidden="true">
          ▶️
        </span>
      </div>

      <div className={style.videoInfo}>
        <h3 className={style.videoTitle}>{video.title}</h3>
        <div className={style.videoChannel}>{video.year}</div>

        <div className={style.videoMeta}>
          <div className={style.metaRow}>
            <span className={style.videoViews}>{formatViews(video.viewCount)}</span>
            <span className={style.videoDate}>
              {isProfileMode && video.libraryCreatedAt ? (
                <>Добавлено: {formatTime(video.libraryCreatedAt)}</>
              ) : (
                <>Загружено: {formatTime(video.createdAt)}</>
              )}
            </span>
          </div>
          {isProfileMode && video.lastWatchedAt && (
            <div className={style.lastWatched}>
              Последний просмотр: {formatTime(video.lastWatchedAt)}
            </div>
          )}
        </div>

        <div className={style.videoActions}>
          <button
            className={`${style.actionButton} ${video.isLiked ? style.liked : ''}`}
            onClick={(e) => {
              e?.stopPropagation();
              video.isLiked ? toggleLike?.(video.id, true) : toggleLike?.(video.id, false);
            }}
            aria-label={video.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
          >
            {video.isLiked ? '❤️' : '🤍'} {video.likesCount}
          </button>

          <button
            className={style.actionButton}
            onClick={(e) => {
              e?.stopPropagation();
              toggleComments?.(video.id);
            }}
            aria-label="Комментировать"
          >
            <span className={style.buttonText}>{video.commentsCount}</span> 💬
          </button>

          {video.isPublic === false && !isOwn ? (
            <span className={style.privateLabel}>🔒 Приватное видео</span>
          ) : (
            <button
              className={style.actionButton}
              onClick={(e) => {
                e?.stopPropagation();
                video.isInLibrary
                  ? removeFromLibrary?.(video.libraryId, video.id)
                  : addToLibrary?.(video.id);
              }}
              aria-label={video.isInLibrary ? 'Убрать из библиотеки' : 'Добавить в библиотеку'}
            >
              {video.isInLibrary ? '📚 В библиотеке' : '➕ В библиотеку'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
