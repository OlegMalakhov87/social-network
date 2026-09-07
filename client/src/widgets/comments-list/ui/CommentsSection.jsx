import { CommentsList } from '..';
import { CommentForm, useFetchComments } from '../../../features/comments';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls } from '../../../shared/hooks';
import { Dropdown, IconButton, SectionCard } from '../../../shared/ui';

/**
 * Секция комментариев. Стартовый компонент для отображения списка комментариев.
 *
 * @param {Object} props
 * @param {string} props.targetType - тип сущности комментариев.
 * @param {number} props.targetId - ID сущности комментариев.
 * @param {Object} props.currentUser - текущий пользователь.
 * @param {Function} props.onChange - функция для обновления количества комментариев.
 * @param {Function} props.onClose - функция для закрытия секции комментариев.
 */
export const CommentsSection = ({
  targetType,
  targetId,
  currentUser,
  onChange,
  onClose,
}) => {
  /** Управление фильтрацией и сортировкой */
  const { sortKey, setSortKey } = useFilterControls({
    initialFilter: 'all',
    initialSort: 'dateAsc',
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
  } = useFetchComments({
    targetType,
    targetId,
    currentUserId: currentUser?.id,
    onChange,
    sortKey,
  });

  return (
    <SectionCard
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
            onClick={onClose}
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
        onEdit={updateComment}
        onDelete={deleteComment}
        toggleLike={toggleLike}
        onRetry={refetch}
      />
      <CommentForm
        currentUser={currentUser}
        onSubmit={addComment}
        onClose={onClose}
      />
    </SectionCard>
  );
};
