import {
  Friend,
  getEmptyDescription,
  getEmptyTitle,
} from '../../../entities/friend';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import { ContentRefetchOverlay, ContentState, InfiniteScrollFooter } from '../../../shared/ui';
import styles from './FriendsGrid.module.css';

/**
 * Сетка карточек друзей с пагинацией.
 * @param {Object} props
 * @param {string} props.filter - фильтр друзей
 * @param {Array} props.friends - список друзей с полями _friendshipStatus и _friendshipDirection
 * @param {boolean} props.isLoading - флаг загрузки
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей порции друзей
 * @param {Error} props.error - ошибка загрузки друзей
 * @param {boolean} props.hasMore - флаг наличия следующей порции друзей
 * @param {Function} props.loadMore - функция загрузки следующей порции друзей
 * @param {Function} props.onRetry - функция повторной загрузки друзей
 * @param {Function} props.onFollow - функция для отправки запроса на добавление в друзья
 * @param {Function} props.onUnfollow - функция для отправки запроса на удаление из друзей
 * @param {Function} props.onAccept - функция для принятия запроса на добавление в друзья
 * @param {Function} props.onUnlock - функция для разблокировки пользователя
 * @param {Function} props.onBlock - функция для блокировки пользователя
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
  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Флаг перезагрузки контента */
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
