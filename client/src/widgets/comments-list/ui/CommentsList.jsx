import { useNavigate } from 'react-router-dom';
import { Comment } from '../../../entities/comment';
import { normalizeSharedComment } from '../../../entities/shared-entity';
import { CommentForm } from '../../../features/comments';
import { useShareEntity } from '../../../features/shared-entities';
import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import style from './CommentsList.module.css';

/**
 * Список комментариев. Содержит в себе список комментариев и форму для добавления нового комментария.
 *
 * @param {Object} props
 * @param {Object} props.comments - список комментариев.
 * @param {Object} props.isLoading - флаг загрузки.
 * @param {Object} props.isLoadingMore - флаг загрузки ещё комментариев.
 * @param {Object} props.hasMore - флаг наличия ещё комментариев.
 * @param {Object} props.error - ошибка.
 * @param {Object} props.currentUser - текущий пользователь.
 * @param {Function} props.loadMore - функция для загрузки ещё комментариев.
 * @param {Function} props.onCommentSubmit - функция для добавления нового комментария.
 * @param {Function} props.onEditComment - функция для редактирования комментария.
 * @param {Function} props.onDeleteComment - функция для удаления комментария.
 * @param {Function} props.toggleLikeComment - функция для лайка комментария.
 * @param {Function} props.onCloseComments - функция для закрытия комментариев.
 * @param {Function} props.onRetry - функция для повторной загрузки комментариев.
 */
export const CommentsList = ({
  comments = [],
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  currentUser,
  loadMore,
  onCommentSubmit,
  onEditComment,
  onDeleteComment,
  toggleLikeComment,
  onCloseComments,
  onRetry,
}) => {
  const navigate = useNavigate();

  /** Хук для работы с расшаренными сущностями в sessionStorage.*/
  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedComment,
    onSuccess: () => navigate('/messages'),
  });

  return (
    <ContentState
      loading={isLoading && comments.length === 0}
      error={error && comments.length === 0}
      isEmpty={!comments?.length}
      loadingMessage="Загружаем комментарии..."
      emptyIcon="💬"
      emptyTitle="Комментариев пока нет"
      emptyDescription="Будьте первым!"
      onRetry={onRetry}
    >
      <div className={style.list}>
        {comments.map((item) => {
          return (
            <Comment
              key={item.comment.id}
              comment={item.comment}
              author={item.author}
              currentUserId={currentUser?.id}
              onShareEntity={shareEntity}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              toggleLike={toggleLikeComment}
            />
          );
        })}

        {comments.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели все комментарии"
          />
        )}

        {error && comments.length > 0 && (
          <ErrorBanner
            message="Не удалось загрузить следующую порцию комментариев"
            onRetry={loadMore}
          />
        )}
      </div>

      <CommentForm
        currentUser={currentUser}
        onClose={onCloseComments}
        onSubmit={onCommentSubmit}
      />
    </ContentState>
  );
};
