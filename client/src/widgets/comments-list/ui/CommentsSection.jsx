import { useRef } from 'react';
import { CommentsList } from '..';
import { CommentForm, useFetchComments } from '../../../features/comments';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls, useScrollNavigation } from '../../../shared/hooks';
import {
  Dropdown,
  EntityHeader,
  IconButton,
  ScrollNavigationButton,
  SectionCard,
  Text,
} from '../../../shared/ui';
import styles from './CommentsSection.module.css';

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
  const bodyRef = useRef(null);

  /** Управление прокруткой */
  const { isPastMiddle, scrollToTop, scrollToBottom } = useScrollNavigation({
    containerRef: bodyRef,
  });

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
  } = useFetchComments({
    targetType,
    targetId,
    currentUserId: currentUser?.id,
    onChange,
    sortKey,
  });

  return (
    <SectionCard>
      <EntityHeader
        leftSlot={<Text variant="h4">Комментарии</Text>}
        rightSlot={
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
      />

      <div className={styles.body}>
        <div className={styles.scrollContainer} ref={bodyRef}>
          <div className={styles.commentComposer}>
            <CommentForm onSubmit={addComment} />
          </div>
          <CommentsList
            comments={comments}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            loadMore={loadMore}
            hasMore={hasMore}
            error={error}
            currentUser={currentUser}
            onEdit={updateComment}
            onDelete={deleteComment}
            toggleLike={toggleLike}
            onRetry={refetch}
            scrollRootRef={bodyRef}
          />
        </div>
        <ScrollNavigationButton
          isPastMiddle={isPastMiddle}
          scrollToTop={scrollToTop}
          scrollToBottom={scrollToBottom}
        />
      </div>
    </SectionCard>
  );
};
