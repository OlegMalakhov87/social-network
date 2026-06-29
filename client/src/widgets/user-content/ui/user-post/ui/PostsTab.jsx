import style from './PostsTab.module.css';
import { PostCard } from '../../../../../entities/post';
import { ContentState } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой постов.
 * @param {Object} props
 * @param {Array} props.posts - массив постов
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля(да или нет)
 * @param {Function} props.onClickVideo - воспроизведение видео
 * @param {Function} props.toggleLikePost - лайк/дизлайк
 * @param {Function} props.onDeletePost - удалить пост
 * @param {Function} props.onToggleComments - открыть комментарии
 * @param {boolean} props.isLoadingPosts - загружен пост или нет
 * @param {string|null} props.errorPosts - ошибка
 * @param {Function} props.onRetry - повторить загрузку
 */

export const PostsTab = ({
  posts,
  currentUser,
  targetUser,
  isProfileOwner,
  onClickVideo,
  toggleLikePost,
  onDeletePost,
  onToggleComments,
  isLoadingPosts,
  errorPosts,
  onRetry,
}) => {
  return (
    <ContentState
      loading={isLoadingPosts || (!currentUser && !targetUser)}
      error={errorPosts}
      isEmpty={!posts?.length}
      loadingMessage="Загружаем посты..."
      emptyIcon="📝"
      emptyTitle="Нет постов"
      emptyDescription={
        isProfileOwner
          ? 'Опубликуйте свой первый пост.'
          : 'Пользователь пока ничего не публиковал.'
      }
      onRetry={onRetry}
    >
      <div className={style.postsList}>
        {posts.map((post) => (
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
        ))}
      </div>
    </ContentState>
  );
};
