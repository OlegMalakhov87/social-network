import style from './CommentsList.module.css';
import { CommentForm, CommentCard } from '../../comment';
import { usePagination } from '../../../shared/lib';
import { Pagination, EmptyState, Loading } from '../../../shared/ui';

/**
 * Список комментариев с формой добавления.
 * @param {Object} props
 * @param {Array} props.comments - массив объектов { comment, likesCount, isLiked }
 * @param {boolean} props.isLoading - загрузка
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.onCommentSubmit - отправка комментария
 * @param {Function} props.onEditComment - редактирование
 * @param {Function} props.onDeleteComment - удаление
 * @param {Function} props.onCloseComments - закрытие панели комментариев
 * @param {Function} props.toggleLikeComment - лайк/дизлайк комментария
 * @param {string|null} props.error - ошибка
 */
export const CommentsList = ({
  comments,
  isLoading,
  currentUser,
  onCommentSubmit,
  onEditComment,
  onDeleteComment,
  toggleLikeComment,
  onCloseComments,
  error,
}) => {
  const pagination = usePagination(comments ?? [], 12, 1);
  const displayedComments = pagination.paginatedItems;

  // Загрузка без комментариев
  if (isLoading && comments?.length === 0) {
    return <Loading message="Загружаем комментарии..." size="medium" />;
  }

  return (
    <div className={style.comments}>
      {displayedComments.length > 0 ? (
        <>
          <div className={style.list}>
            {displayedComments.map(({ comment, author }) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                author={author}
                currentUser={currentUser}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
                toggleLike={toggleLikeComment}
              />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <Pagination
              totalPages={pagination.totalPages}
              page={pagination.currentPage}
              onPageChange={pagination.goToPage}
            />
          )}
        </>
      ) : (
        <div className={style.emptyWrapper}>
          <EmptyState icon="💬" title="Комментариев пока нет" description="Будьте первым!" />
        </div>
      )}

      <CommentForm
        currentUser={currentUser}
        isLoading={isLoading}
        onSubmit={onCommentSubmit}
        commentsCount={comments?.length ?? 0}
        onCancel={onCloseComments}
      />
    </div>
  );
};
