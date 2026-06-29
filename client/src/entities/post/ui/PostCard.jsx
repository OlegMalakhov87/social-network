import { useNavigate } from 'react-router-dom';
import { PostHeader, PostContent, PostActions } from '../../../entities/post';
import { getPostActions } from '../../../shared/lib';
import { MediaCardLayout } from '../../../shared/ui';

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
  const navigate = useNavigate();

  if (!post?.id) return null;

  const actions = getPostActions({
    post,
    currentUser,
    toggleLike,
    toggleComments,
    onDelete,
    onShare: () => {
      sessionStorage.setItem('sharedPostId', post.id);
      navigate('/messages');
    },
  });

  return (
    <MediaCardLayout
      header={<PostHeader user={targetUser} createdAt={post.createdAt} />}
      content={<PostContent post={post} onPlay={onPlay} />}
      actions={<PostActions actions={actions} />}
    />
  );
};
