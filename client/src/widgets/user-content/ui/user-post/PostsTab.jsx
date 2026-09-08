import { useNavigate } from 'react-router-dom';
import { Post } from '../../../../entities/post';
import { normalizeSharedPost } from '../../../../entities/shared-entity';
import { useShareEntity } from '../../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import { EntityWithComments } from '../../../entity-comments';
import styles from './PostsTab.module.css';

/**
 * Вкладка с сеткой постов.
 * @param {Object} props
 * @param {Array} props.posts - массив постов
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля(да или нет)
 * @param {boolean} props.isLoading - загружен пост или нет
 * @param {string|null} props.error - ошибка
 * @param {Function} props.onPlayPost - воспроизведение поста
 * @param {Object} props.currentPost - текущий пост
 * @param {boolean} props.isPlaying - воспроизводится ли пост
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.deletePost - удалить пост
 * @param {Function} props.toggleComments - открыть комментарии / закрыть комментарии
 * @param {Object} props.commentTarget - целевой тип и id комментариев
 * @param {Function} props.onCloseComments - закрыть комментарии
 * @param {Function} props.onCommentChange - изменить количество комментариев
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
  onPlayPost,
  currentPost,
  isPlaying,
  toggleLike,
  deletePost,
  updatePost,
  toggleComments,
  loadMore,
  hasMore,
  onRetry,
  commentTarget,
  onCloseComments,
  onCommentChange,
}) => {
  const navigate = useNavigate();

   /** Хук для работы с расшаренными сущностями в sessionStorage.*/
   const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedPost,
    onSuccess: () => navigate('/messages'),
  });

  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && posts.length > 0;

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={
          (isLoading && posts.length === 0) || (!currentUser && !targetUser)
        }
        error={posts.length === 0 ? error : null}
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
        <div className={styles.postsList}>
          {posts.map((post) => (
            <EntityWithComments
              key={post.id}
              entity={post}
              targetType="posts"
              isOpen={commentTarget?.id === post.id}
              onClose={onCloseComments}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
              renderEntity={(entity) => (
                <Post
                  post={entity}
                  targetUser={targetUser}
                  currentUser={currentUser}
                  onShareEntity={shareEntity}
                  onPlay={onPlayPost}
                  toggleLike={toggleLike}
                  onDelete={deletePost}
                  onUpdate={updatePost}
                  toggleComments={toggleComments}
                  currentPost={currentPost}
                  isPlaying={isPlaying}
                />
              )}
            />
          ))}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {posts.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все посты"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
