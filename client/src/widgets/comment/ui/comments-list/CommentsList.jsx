import { useNavigate } from 'react-router-dom';

import { Comment } from '../../../../entities/comment';
import { normalizeSharedComment } from '../../../../entities/shared-entity';
import { useShareEntity } from '../../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';

import styles from './CommentsList.module.css';

/**
 * Отображает список комментариев с подгрузкой при прокрутке.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.comments=[]] - Список комментариев
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.onEdit - Обработчик редактирования комментария
 * @param {Function} props.onDelete - Обработчик удаления комментария
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {React.RefObject} props.scrollRootRef - Корень прокрутки для подгрузки
 * @returns {JSX.Element} Разметка списка.
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

  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedComment,
    onSuccess: () => navigate('/messages'),
  });

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
    rootRef: scrollRootRef,
  });

  // Показывает наложение, пока список обновляется при уже загруженных комментариях.
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
