import { Post } from '../../../../entities/post';

import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import style from './PostsTab.module.css';

/**
 * Вкладка с сеткой постов.
 * @param {Object} props
 * @param {Array} props.posts - массив постов
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля(да или нет)
 * @param {boolean} props.isLoading - загружен пост или нет
 * @param {string|null} props.error - ошибка
 * @param {Function} props.onPlayVideo - воспроизведение видео
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.deletePost - удалить пост
 * @param {Function} props.toggleComments - открыть комментарии / закрыть комментарии
 * @param {Function} props.onRetry - повторить загрузку
 * @param {boolean} props.hasMore - есть ли еще посты для загрузки
 * @param {Function} props.loadMore - функция для загрузки следующей страницы постов
 */

export const PostsTab = ({
  posts = [],
  currentUser,
  targetUser,
  isOwnProfile,
  isLoading,
  isLoadingMore,
  error,
  onPlayVideo,
  toggleLike,
  deletePost,
  updatePost,
  toggleComments,
  loadMore,
  hasMore,
  onRetry,
}) => {
  return (
    <ContentState
      loading={
        (isLoading && posts.length === 0) || (!currentUser && !targetUser)
      }
      error={error && posts.length === 0}
      isEmpty={!posts?.length}
      loadingMessage="Загружаем посты..."
      emptyIcon="📝"
      emptyTitle="Нет постов"
      emptyDescription={
        isOwnProfile
          ? 'Опубликуйте свой первый пост.'
          : 'У пользователя пока нет публичных постов.'
      }
      onRetry={onRetry}
    >
      <div className={style.postsList}>
        {posts.map((item) => {
          return (
            <Post
              post={item}
              targetUser={targetUser}
              currentUser={currentUser}
              onPlay={onPlayVideo}
              toggleLike={toggleLike}
              onDelete={deletePost}
              onUpdate={updatePost}
              toggleComments={toggleComments}
            />
          );
        })}

        {posts.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели все посты"
          />
        )}

        {error && posts.length > 0 && (
          <ErrorBanner
            message="Не удалось загрузить следующую порцию постов"
            onRetry={loadMore}
          />
        )}
      </div>
    </ContentState>
  );
};
