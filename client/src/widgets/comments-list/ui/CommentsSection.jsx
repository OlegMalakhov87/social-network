import { useFetchComments } from '../../../features/comments';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls } from '../../../shared/hooks';
import { Dropdown, IconButton, SectionCard } from '../../../shared/ui';
import { CommentsList } from './CommentsList';

/**
 * Секция комментариев. Стартовый компонент для отображения списка комментариев.
 *
 * @param {Object} props
 * @param {string} props.targetType - тип цели комментариев.
 * @param {number} props.targetId - ID цели комментариев.
 * @param {Object} props.currentUser - текущий пользователь.
 * @param {Function} props.onChange - функция для обновления количества комментариев.
 * @param {Function} props.onCloseComments - функция для закрытия секции комментариев.
 * @param {React.Ref<HTMLDivElement>} props.commentsSectionRef - ссылка на секцию комментариев.
 */
export const CommentsSection = ({
  targetType,
  targetId,
  currentUser,
  onChange,
  onCloseComments,
  commentsSectionRef,
}) => {
  /** Управление фильтрацией и сортировкой */
  const { sortKey, setSortKey } = useFilterControls({
    initialFilter: 'all',
    initialSort: 'dateDesc',
  });

  /** Получение данных о комментариях */
  const {
    comments,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
  } = useFetchComments(
    targetType,
    targetId,
    currentUser?.id,
    onChange,
    sortKey
  );

  return (
    <SectionCard
      ref={commentsSectionRef}
      title="Комментарии"
      actions={
        <>
          <Dropdown
            options={SORT_OPTIONS}
            currentSort={sortKey}
            onChange={setSortKey}
          />
          <IconButton
            icon="✕"
            variant="ghost"
            size="sm"
            onClick={onCloseComments}
            ariaLabel="Закрыть комментарии"
          />
        </>
      }
    >
      <CommentsList
        comments={comments}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        error={error}
        currentUser={currentUser}
        loadMore={loadMore}
        onCommentSubmit={addComment}
        onEditComment={updateComment}
        onDeleteComment={deleteComment}
        toggleLikeComment={toggleLike}
        onCloseComments={onCloseComments}
        onRetry={refetch}
      />
    </SectionCard>
  );
};
