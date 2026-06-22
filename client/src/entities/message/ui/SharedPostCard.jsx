import style from './SharedPostCard.module.css';
import { formatViews, ImageWithFallback, linkify } from '../../../shared/lib';

/**
 * Карточка одного сообщения.
 * @param {Object} props
 * @param {Object} props.post - объект сообщения
 * @param {Function} props.onPlayVideo - воспроизвести видео
 */
export const SharedPostCard = ({ post, onPlayVideo }) => {
  const isVideo = post.postType === 'video';

  console.log(post);

  const handleWatchVideo = () => {
    onPlayVideo?.({
      message: post.message,
      mediaUrl: post.mediaUrl,
      isLiked: post.isLiked,
      likesCount: post.commentsCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
      createdAt: post.createdAt,
    });
  };

  return (
    <div className={style.card}>
      <div className={style.header}>
        <ImageWithFallback
          src={post.author.photoUrl}
          alt="Фото"
          fallback="/userPhoto.jpg"
          className={style.avatar}
        />
        <span className={style.authorName}>{post.author.name}</span>
      </div>
      <div className={style.body}>
        {isVideo ? (
          <div
            className={style.videoBlock}
            onClick={(e) => {
              e?.stopPropagation();
              handleWatchVideo();
            }}
            role="button"
            tabIndex={0}
          >
            <span className={style.playIcon}>▶️</span>
            <span className={style.watchText}>Смотреть видео</span>
          </div>
        ) : (
          post.mediaUrl && (
            <ImageWithFallback
              src={post.mediaUrl}
              alt="Вложение"
              fallback="/error.png"
              className={style.media}
            />
          )
        )}
        <p className={style.text}>{linkify(post.message)}</p>
      </div>
      <div className={style.footer}>
        <span className={style.stat}>❤️ {formatViews(post.likesCount)}</span>
        <span className={style.stat}>💬 {formatViews(post.commentsCount)}</span>
      </div>
    </div>
  );
};
