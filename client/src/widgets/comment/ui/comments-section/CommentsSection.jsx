import { useRef } from 'react';

import { CommentsList } from '../../';
import { CommentForm, useFetchComments } from '../../../../features/comments';
import { SORT_OPTIONS } from '../../../../shared/config';
import {
  useFilterControls,
  useScrollNavigation,
} from '../../../../shared/hooks';
import {
  Dropdown,
  EntityHeader,
  IconButton,
  ScrollNavigationButton,
  SectionCard,
  Text,
} from '../../../../shared/ui';

import styles from './CommentsSection.module.css';

/**
 * Отображает секцию комментариев с сортировкой и формой отправки.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.targetType - Тип комментируемой сущности
 * @param {number} props.targetId - Идентификатор комментируемой сущности
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {Function} props.onChange - Обработчик изменения количества комментариев
 * @param {Function} props.onClose - Обработчик закрытия секции
 * @returns {JSX.Element} Разметка секции.
 */
export const CommentsSection = ({
  targetType,
  targetId,
  currentUser,
  onChange,
  onClose,
}) => {
  const bodyRef = useRef(null);

  const { isPastMiddle, scrollToTop, scrollToBottom } = useScrollNavigation({
    containerRef: bodyRef,
  });

  const { sortKey, setSortKey } = useFilterControls({
    initialFilter: 'all',
    initialSort: 'dateDesc',
  });

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
            <CommentForm onSubmit={addComment} currentUser={currentUser} />
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
          className={styles.scrollNavDock}
        />
      </div>
    </SectionCard>
  );
};
