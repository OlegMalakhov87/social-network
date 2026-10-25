import { Dialog } from '../../../entities/dialog';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import { ContentState, InfiniteScrollFooter } from '../../../shared/ui';

import styles from './DialogsGrid.module.css';

/**
 * Отображает список диалогов с подгрузкой при прокрутке.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{user: Object, lastMessage: Object}>} [props.dialogs=[]] - Список диалогов
 * @param {Function} props.onSelect - Обработчик выбора диалога
 * @param {number} props.selectedUserId - Идентификатор выбранного пользователя
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @returns {JSX.Element} Разметка списка.
 */
export const DialogsGrid = ({
  dialogs = [],
  onSelect,
  selectedUserId,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  loadMore,
  onRetry,
}) => {
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  return (
    <ContentState
      loading={isLoading && dialogs.length === 0}
      error={error && dialogs?.length === 0}
      isEmpty={!dialogs?.length}
      loadingMessage="Загружаем диалоги..."
      emptyIcon="💬"
      emptyTitle="Нет диалогов"
      emptyDescription="Начните общение с друзьями"
      onRetry={onRetry}
    >
      <ul className={styles.dialogsList}>
        {dialogs.map(({ user, lastMessage }) => {
          return (
            <li key={user.id}>
              <Dialog
                user={user}
                isActive={selectedUserId === user.id}
                onSelect={onSelect}
                lastMessage={lastMessage}
              />
            </li>
          );
        })}
      </ul>

      <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

      {dialogs.length > 0 && (
        <InfiniteScrollFooter
          hasMore={hasMore}
          isLoading={isLoadingMore}
          error={error}
          onRetry={loadMore}
          endMessage="Диалогов больше нет"
        />
      )}
    </ContentState>
  );
};
