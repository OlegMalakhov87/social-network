import style from './PostCard.module.css';
import { ImageWithFallback, formatTime, linkify } from '../../../shared/lib';

/**
 * Карточка поста.
 * @param {Object} props
 * @param {Object} props.post - данные поста
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {Function} props.onPlay - клик по видео (воспроизвести)
 * @param {Function} props.toggleLike - колбэк лайка/дизлайка
 * @param {Function} props.onDelete - колбэк удаления
 * @param {Function} props.toggleComments - колбэк открытия/закрытия комментариев (получает post.id)
 */
export const PostCard = ({
  post,
  currentUser,
  targetUser,
  onPlay,
  toggleLike,
  onDelete,
  toggleComments,
}) => {
  // Защита от отсутствия поста
  if (!post?.id) return null;

  const handleShare = () => {
    sessionStorage.setItem('sharedPostId', post.id);
    window.location.href = '/messages';
  };

  // Вспомогательная функция рендера контента
  const renderContent = () => {
    switch (post.postType) {
      case 'image':
        return (
          <div className={style.content}>
            <ImageWithFallback src={post.mediaUrl} alt="Изображение поста" fallback="/error.png" />
            {post.text && <p className={style.videoDescription}>{linkify(post.text)}</p>}
          </div>
        );

      case 'video':
        return (
          <div className={style.content}>
            <div
              className={style.videoPreview}
              onClick={(e) => {
                e?.stopPropagation();
                onPlay?.(post);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') e?.stopPropagation();
                onPlay?.(post);
              }}
              aria-label="Воспроизвести видео"
            >
              <ImageWithFallback
                src={`https://picsum.photos/320/180?random"=${post.id}`}
                alt="Видео"
                fallback="/error.png"
              />
              <span className={style.playIcon} aria-hidden="true">
                ▶️
              </span>
            </div>
            {post.text && <p className={style.videoDescription}>{linkify(post.text)}</p>}
          </div>
        );
      case 'text':
      default:
        return <div className={style.content}>{linkify(post.text)}</div>;
    }
  };

  return (
    <div className={style.post}>
      <div className={style.postHeader}>
        <ImageWithFallback
          className={style.avatar}
          src={targetUser.photoUrl}
          alt="Фото автора"
          fallback="/userPhoto.jpg"
        />
        <div className={style.postInfo}>
          <span className={style.author}>{targetUser.name}</span>
          <span className={style.date}>{formatTime(post.createdAt)}</span>
        </div>
      </div>

      <div className={style.content}>{renderContent()}</div>

      <div className={style.actions}>
        <button
          className={`${style.actionButton} ${style.likeButton}`}
          onClick={(e) => {
            e?.stopPropagation();
            post.isLiked ? toggleLike?.(post.id, true) : toggleLike?.(post.id, false);
          }}
          aria-label={post.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
        >
          {post.isLiked ? '❤️' : '🤍'}
          <span className={style.buttonText}>{post.likesCount}</span>
        </button>

        <button
          className={style.actionButton}
          onClick={(e) => {
            e?.stopPropagation();
            toggleComments?.(post.id);
          }}
          aria-label="Комментировать"
        >
          <span className={style.buttonText}>{post.commentsCount}</span> 💬
          <span className={style.fullText}> Комментировать</span>
        </button>

        {post.visibility === 'public' && (
          <button className={style.actionButton} onClick={handleShare}>
            ↗️ <span className={style.buttonText}>Поделиться</span>
          </button>
        )}

        {currentUser?.id === post.userId && (
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onDelete?.(post.id);
            }}
            className={style.actionButton}
            aria-label="Удалить пост"
          >
            🗑️ <span className={style.buttonText}>Удалить</span>
          </button>
        )}
      </div>
    </div>
  );
};
