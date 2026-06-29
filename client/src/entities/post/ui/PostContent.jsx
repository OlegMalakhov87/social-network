import style from './PostContent.module.css';
import { MediaPreview } from '../../../../shared/ui';
import { linkify } from '../../../../shared/lib';

/**
 * Контент карточки поста.
 */

export const PostContent = ({ post, onPlay }) => {
  return (
    <section className={style.content}>
      {(post.type === 'image' || post.type === 'video') && (
        <MediaPreview
          type={post.type}
          src={post.mediaUrl}
          alt="Фото"
          onPlay={onPlay}
        />
      )}

      {post.text && <div className={style.text}>{linkify(post.text)}</div>}
    </section>
  );
};
