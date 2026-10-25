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
import { EntityWithComments } from '../../../comment';

import styles from './PostsTab.module.css';

/**
 * Отображает вкладку с сеткой постов.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.posts=[]] - Список постов
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Object} props.targetUser - Пользователь открытого профиля
 * @param {boolean} props.isOwnProfile - Признак собственного профиля
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {Function} props.onPlayPost - Обработчик воспроизведения поста
 * @param {Object} props.currentPost - Текущий пост
 * @param {boolean} props.isPlaying - Признак воспроизведения поста
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.deletePost - Обработчик удаления поста
 * @param {Function} props.updatePost - Обработчик обновления поста
 * @param {Function} props.toggleComments - Обработчик открытия и закрытия комментариев
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Function} props.onCommentChange - Обработчик изменения количества комментариев
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @returns {JSX.Element} Разметка вкладки.
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

  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedPost,
    onSuccess: () => navigate('/messages'),
  });

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  // Показывает наложение, пока список обновляется при уже загруженных постах.
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
