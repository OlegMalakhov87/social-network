import style from './PhotoCard.module.css';
import { ImageWithFallback, formatTime } from '../../../shared/lib';

/**
 * Карточка фотографии (вкладка "Фото" в профиле).
 * @param {Object} props
 * @param {Object} props.photo - объект поста с типом image
 * @param {boolean} props.isOwn - принадлежит ли фото текущему пользователю
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.onDelete - удалить
 * @param {Function} props.toggleComments - открыть/закрыть комментарии
 */
export const PhotoCard = ({ photo, isOwn, onDelete, toggleLike, toggleComments }) => {
  if (!photo?.id) return null;

  const handleShare = () => {
    sessionStorage.setItem('sharedPostId', photo.id);
    window.location.href = '/messages';
  };

  return (
    <div className={style.photoCard}>
      {isOwn && (
        <button
          className={style.deletePhotoButton}
          onClick={(e) => {
            e?.stopPropagation();
            onDelete?.(photo.id);
          }}
          aria-label="Удалить фото"
        >
          ✕
        </button>
      )}

      <div className={style.photoContainer}>
        <ImageWithFallback
          className={style.photoImage}
          src={photo.mediaUrl}
          alt="Фото"
          fallback="/error.png"
        />
      </div>

      <div className={style.photoFooter}>
        <div className={style.photoActions}>
          <button
            className={`${style.actionButton} ${style.likeButton}`}
            onClick={(e) => {
              e?.stopPropagation();
              photo.isLiked ? toggleLike?.(photo.id, true) : toggleLike?.(photo.id, false);
            }}
            aria-label={photo.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
          >
            {photo.isLiked ? '❤️' : '🤍'} {photo.likesCount}
          </button>

          <button
            className={style.actionButton}
            onClick={(e) => {
              e?.stopPropagation();
              toggleComments?.(photo.id);
            }}
            aria-label="Комментировать"
          >
            💬 {photo.commentsCount}
          </button>
          {photo.visibility === 'public' && (
            <button className={style.actionButton} onClick={handleShare}>
              ↗️ <span className={style.buttonText}>Поделиться</span>
            </button>
          )}
        </div>
        <div className={style.photoDate}>{formatTime(photo.createdAt)}</div>
      </div>
    </div>
  );
};
