import style from './PostsTab.module.css';
import { PostCard } from '../../../../../entities/post';
import { EmptyState, Loading } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой постов.
 * @param {Object} props
 * @param {Array} props.items - массив постов
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {Function} props.onClickVideo - воспроизведение видео
 * @param {Function} props.toggleLikePost - лайк/дизлайк
 * @param {Function} props.onDeletePost - удалить пост
 * @param {Function} props.onToggleComments - открыть комментарии
 * @param {boolean} props.isLoadingPosts - загружен пост или нет
 * @param {string} errorPosts - ошибка
 */

export const PostsTab = ({
  items,
  currentUser,
  targetUser,
  onClickVideo,
  toggleLikePost,
  onDeletePost,
  onToggleComments,
  isLoadingPosts,
  errorPosts,
}) => {
  // Состояние загрузки вкладки с постами
  if (isLoadingPosts || !(currentUser || targetUser)) {
    return <Loading fullPage message="Загружаем посты..." size="large" />;
  }

  if (!items?.length) {
    return (
      <div className={style.emptyWrapper}>
        <EmptyState
          icon="📝"
          title="Нет постов"
          description={
            currentUser?.id === items?.[0]?.userId
              ? 'Поделитесь своими мыслями с друзьями!'
              : 'У пользователя пока нет публичных постов'
          }
        />
      </div>
    );
  }

  return (
    <div className={style.postsList}>
      {items.map((post) => {
        return (
          <PostCard
            key={post.id}
            post={post}
            targetUser={targetUser}
            currentUser={currentUser}
            onPlay={onClickVideo}
            toggleLike={toggleLikePost}
            onDelete={onDeletePost}
            toggleComments={onToggleComments}
          />
        );
      })}
    </div>
  );
};
