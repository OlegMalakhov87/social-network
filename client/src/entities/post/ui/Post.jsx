import { useNavigate } from 'react-router-dom';
import { formatTime, getPostActions } from '../../../shared/lib';
import {
  BaseCard,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
  Text,
} from '../../../shared/ui';

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
export const Post = ({
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
      sessionStorage.setItem('sharedPostId', post?.id);
      navigate('/messages');
    },
  });

  return (
    <BaseCard
      header={
        <EntityHeader>
          <EntityMeta
            avatar={targetUser?.photoUrl}
            title={targetUser?.name}
            subtitle={formatTime(post?.createdAt)}
          />
        </EntityHeader>
      }
      content={
        <EntityContent>
          {post?.mediaUrl && (
            <MediaPreview
              item={post}
              src={post?.mediaUrl}
              alt="Фото"
              onClick={() => onPlay?.(post)}
            />
          )}
          {post?.text && <Text linkifyText>{post?.text}</Text>}
        </EntityContent>
      }
      actions={<EntityActions actions={actions} />}
    />
  );
};
