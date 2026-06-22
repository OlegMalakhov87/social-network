import style from './TrackCard.module.css';
import { ImageWithFallback, formatViews, formatTimeAudio } from '../../../shared/lib';

/**
 * Карточка одного трека.
 * @param {Object} props
 * @param {Object} props.track - объект трека
 * @param {Array} props.allTracks - все треки текущего контекста (для очереди)
 * @param {boolean} props.isPlaying - проигрывается ли трек сейчас (true/false)
 * @param {Object} props.currentTrack - текущий играющий трек
 * @param {Function} props.onPlay - начать воспроизведение
 * @param {Function} props.toggle - переключить play/pause текущего трека
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwn - принадлежит ли трек текущему пользователю
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {Function} props.addToLibrary - добавить в библиотеку
 * @param {Function} props.removeFromLibrary - удалить из библиотеки
 * @param {Function} props.toggleFavorite - добавит/удалить из избранного
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.delete - удалить трек
 * @param {Function} props.toggleComments - открыть/закрыть комментарии
 */
export const TrackCard = ({
  track,
  allTracks,
  isPlaying,
  currentTrack,
  onPlay,
  toggle,
  currentUser,
  isOwn,
  isProfileOwner,
  mode,
  addToLibrary,
  removeFromLibrary,
  toggleFavorite,
  toggleLike,
  onDelete,
  toggleComments,
}) => {
  if (!track?.id) return null;

  const showFavorite = mode === 'profile' && isProfileOwner && track.isInLibrary;

  const handlePlayClick = () => {
    if (currentTrack?.id === track.id) {
      toggle?.();
    } else {
      onPlay?.(track, allTracks);
    }
  };

  return (
    <div className={style.trackCard}>
      {showFavorite && (
        <button
          className={style.favoriteButton}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite?.(track.id, track.libraryId, track.isFavorite, track.playCount);
          }}
          aria-label={track.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          {track.isFavorite ? '⭐' : '☆'}
        </button>
      )}

      {isOwn && (
        <button
          className={style.deleteMusicButton}
          onClick={(e) => {
            e?.stopPropagation();
            onDelete?.(track.id);
          }}
          aria-label="Удалить трек"
        >
          ✕
        </button>
      )}

      <div
        className={style.trackCover}
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
        aria-label={currentTrack?.id === track.id && isPlaying ? 'Пауза' : 'Воспроизвести'}
      >
        <ImageWithFallback
          src={`https://picsum.photos/320/180?random=${track.id}`}
          alt="Обложка"
          fallback="/error.png"
        />
        <span className={style.trackDuration}>{formatTimeAudio(track.duration)}</span>
        <span className={style.playButton} aria-hidden="true">
          {currentTrack?.id === track.id && isPlaying ? '⏸️' : '▶️'}
        </span>
      </div>

      <div className={style.trackInfo}>
        <h3 className={style.trackTitle}>{track.title}</h3>
        <div className={style.trackArtist}>{track.artist}</div>
        <div className={style.trackMeta}>
          <span className={style.trackAlbum} title={track.album}>
            {track.album}
          </span>
          <span className={style.trackYear}>{track.year}</span>
        </div>

        <div className={style.trackActions}>
          <button
            className={`${style.actionButton} ${track.isLiked ? style.liked : ''}`}
            onClick={(e) => {
              e?.stopPropagation();
              track.isLiked ? toggleLike?.(track.id, true) : toggleLike?.(track.id, false);
            }}
            aria-label={track.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
          >
            {track.isLiked ? '❤️' : '🤍'} {track.likesCount}
          </button>

          <button
            className={style.actionButton}
            onClick={(e) => {
              e?.stopPropagation();
              toggleComments?.(track.id);
            }}
            aria-label="Комментировать"
          >
            <span className={style.buttonText}>{track.commentsCount}</span> 💬
          </button>

          {track.isPublic === false && !isOwn ? (
            <span className={style.privateLabel}>🔒 Личный трек</span>
          ) : (
            <button
              className={style.actionButton}
              onClick={(e) => {
                e?.stopPropagation();
                track.isInLibrary
                  ? removeFromLibrary?.(track.libraryId, track.id)
                  : addToLibrary?.(track.id);
              }}
              aria-label={track.isInLibrary ? 'Убрать из библиотеки' : 'Добавить в библиотеку'}
            >
              {track.isInLibrary ? '📚 В библиотеке' : '➕ В библиотеку'}
            </button>
          )}
          <span className={style.playCount}>
            ▶️
            {formatViews(track.playCount)}
          </span>
        </div>
      </div>
    </div>
  );
};
