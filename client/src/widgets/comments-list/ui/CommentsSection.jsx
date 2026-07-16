import { useFetchComments } from '../../../features/comments';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls } from '../../../shared/hooks';
import { Dropdown, IconButton, SectionCard } from '../../../shared/ui';
import { CommentsList } from './CommentsList';

/**
 * Секция комментариев. Стартовый компонент для отображения списка комментариев.
 *
 * @param {Object} props
 * @param {string} props.targetType - Тип цели комментариев.
 * @param {number} props.targetId - ID цели комментариев.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {Function} props.onChange - Функция для обновления количества комментариев.
 * @param {Function} props.onCloseComments - Функция для закрытия секции комментариев.
 * @param {Ref} props.commentsSectionRef - Ссылка на секцию комментариев.
 */

export const CommentsSection = (props) => {
  const {
    targetType,
    targetId,
    currentUser,
    onChange,
    onCloseComments,
    commentsSectionRef,
  } = props;

  /** Управление фильтрацией и сортировкой */
  const { sortKey, setSortKey } = useFilterControls({
    initialFilter: 'all',
    initialSort: 'dateDesc',
  });

  /** Получение данных о комментариях */
  const {
    comments,
    isLoading,
    hasMore,
    error,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    toggleLikeComment,
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
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
        currentUser={currentUser}
        onCommentSubmit={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        toggleLikeComment={toggleLikeComment}
        onCloseComments={onCloseComments}
        onRetry={refetch}
        loadMore={loadMore}
      />
    </SectionCard>
  );
};
