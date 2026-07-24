import { Dialog } from '../../../entities/dialog';
import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../shared/ui';
import style from './DialogsGrid.module.css';

/**
 * Сетка списка диалогов.
 * @param {Object} props
 * @param {Array} props.dialogs - массив { user, lastMessage }
 * @param {Function} props.onSelect - колбэк выбора (возвращает функцию)
 * @param {number} props.selectedUserId - ID выбранного пользователя
 * @param {boolean} props.isLoading - флаг загрузки
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей порции
 * @param {Error} props.error - ошибка
 * @param {boolean} props.hasMore - флаг наличия следующей порции
 * @param {Function} props.loadMore - колбэк загрузки следующей порции
 * @param {Function} props.onRetry - колбэк повторной загрузки
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
      <ul className={style.dialogsList}>
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

      {dialogs.length > 0 && (
        <InfiniteScrollFooter
          hasMore={hasMore}
          isLoading={isLoadingMore}
          error={error}
          onRetry={loadMore}
          endMessage="Диалогов больше нет"
        />
      )}

      {error && dialogs.length > 0 && (
        <ErrorBanner
          message="Не удалось загрузить диалоги"
          onRetry={loadMore}
        />
      )}
    </ContentState>
  );
};
