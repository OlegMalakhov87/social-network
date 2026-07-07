import { Post } from '../../../../../entities/post';
import { ContentState } from '../../../../../shared/ui';
import style from './PostsTab.module.css';

/**
 * Вкладка с сеткой постов.
 * @param {Object} props
 * @param {Array} props.posts - массив постов
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля(да или нет)
 * @param {boolean} props.isLoading - загружен пост или нет
 * @param {string|null} props.error - ошибка
 * @param {Function} props.onPlayVideo - воспроизведение видео
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.deletePost - удалить пост
 * @param {Function} props.toggleComments - открыть комментарии / закрыть комментарии
 * @param {Function} props.onRetry - повторить загрузку
 */

export const PostsTab = ({
  posts = [],
  currentUser,
  targetUser,
  isProfileOwner,
  isLoading,
  error,
  onPlayVideo,
  toggleLike,
  deletePost,
  toggleComments,
  onRetry,
}) => {
  return (
    <ContentState
      loading={isLoading || (!currentUser && !targetUser)}
      error={error}
      isEmpty={!posts?.length}
      loadingMessage="Загружаем посты..."
      emptyIcon="📝"
      emptyTitle="Нет постов"
      emptyDescription={
        isProfileOwner
          ? 'Опубликуйте свой первый пост.'
          : 'У пользователя пока нет публичных постов.'
      }
      onRetry={onRetry}
    >
      <div className={style.postsList}>
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            targetUser={targetUser}
            currentUser={currentUser}
            onPlay={onPlayVideo}
            toggleLike={toggleLike}
            onDelete={deletePost}
            toggleComments={toggleComments}
          />
        ))}
      </div>
    </ContentState>
  );
};
