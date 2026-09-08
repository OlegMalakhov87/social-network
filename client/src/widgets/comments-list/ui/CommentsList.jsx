import { useNavigate } from 'react-router-dom';
import { Comment } from '../../../entities/comment';
import { normalizeSharedComment } from '../../../entities/shared-entity';
import { useShareEntity } from '../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import styles from './CommentsList.module.css';

/**
 * Список комментариев с поддержкой пагинации, бесконечной прокрутки и операций над комментариями.
 *
 * @param {Object} props
 * @param {Object} props.comments - список комментариев.
 * @param {boolean} props.isLoading - флаг загрузки.
 * @param {boolean} props.isLoadingMore - флаг загрузки ещё комментариев.
 * @param {boolean} props.hasMore - флаг наличия ещё комментариев.
 * @param {Error} props.error - ошибка.
 * @param {Object} props.currentUser - текущий пользователь.
 * @param {Function} props.loadMore - функция для загрузки ещё комментариев.
 * @param {Function} props.onEdit - функция для редактирования комментария.
 * @param {Function} props.onDelete - функция для удаления комментария.
 * @param {Function} props.toggleLike - функция для лайка комментария.
 * @param {Function} props.onRetry - функция для повторной загрузки комментариев.
 * @param {React.RefObject} props.scrollRootRef - Ref на элемент, относительно которого наблюдается пересечение.
 */
export const CommentsList = ({
  comments = [],
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  currentUser,
  loadMore,
  onEdit,
  onDelete,
  toggleLike,
  onRetry,
  scrollRootRef,
}) => {
  const navigate = useNavigate();

  /** Хук для работы с расшаренными сущностями в sessionStorage.*/
  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedComment,
    onSuccess: () => navigate('/messages'),
  });

  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
    rootRef: scrollRootRef,
  });

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && comments.length > 0;

  return (
    <>
      <ContentState
        loading={isLoading && comments.length === 0}
        error={comments.length === 0 ? error : null}
        isEmpty={!comments?.length}
        loadingMessage="Загружаем комментарии..."
        emptyIcon="💬"
        emptyTitle="Комментариев пока нет"
        emptyDescription="Будьте первым!"
        onRetry={onRetry}
      >
        <div className={styles.list}>
          {comments.map((comment) => {
            return (
              <Comment
                key={comment.id}
                comment={comment}
                author={comment.author}
                currentUserId={currentUser?.id}
                onShareEntity={shareEntity}
                onEdit={onEdit}
                onDelete={onDelete}
                toggleLike={toggleLike}
              />
            );
          })}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {comments.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все комментарии"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </>
  );
};
