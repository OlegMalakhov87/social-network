import {
  Friend,
  getEmptyDescription,
  getEmptyTitle,
} from '../../../entities/friend';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import { ContentRefetchOverlay, ContentState, InfiniteScrollFooter } from '../../../shared/ui';

import styles from './FriendsGrid.module.css';

/**
 * Отображает сетку карточек друзей с подгрузкой при прокрутке.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.filter - Текущий фильтр списка
 * @param {Array<Object>} [props.friends=[]] - Список друзей
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {Function} props.onFollow - Обработчик запроса в друзья
 * @param {Function} props.onUnfollow - Обработчик удаления из друзей
 * @param {Function} props.onAccept - Обработчик принятия запроса в друзья
 * @param {Function} props.onUnlock - Обработчик снятия блокировки
 * @param {Function} props.onBlock - Обработчик блокировки пользователя
 * @returns {JSX.Element} Разметка сетки.
 */
export const FriendsGrid = ({
  filter,
  friends = [],
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  loadMore,
  onRetry,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  // Показывает наложение, пока список обновляется при уже загруженных карточках.
  const isRefetching = isLoading && friends.length > 0;

  return (
    <div className={styles.contentArea}>
    <ContentState
      loading={isLoading && friends.length === 0}
      error={error && friends.length === 0}
      isEmpty={!friends?.length}
      loadingMessage="Загружаем друзей..."
      emptyIcon="👥"
      emptyTitle={getEmptyTitle(filter)}
      emptyDescription={getEmptyDescription(filter)}
      onRetry={onRetry}
    >
      <div className={styles.friendsGrid}>
        {friends.map((friend) => (
          <Friend
            key={friend.id}
            friend={friend}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onAccept={onAccept}
            onUnlock={onUnlock}
            onBlock={onBlock}
          />
        ))}

        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

        {friends.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели всех друзей"
          />
        )}
      </div>
    </ContentState>

    {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
