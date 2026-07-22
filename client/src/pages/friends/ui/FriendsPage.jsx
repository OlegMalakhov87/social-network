import { FRIEND_CATEGORIES } from '../../../entities/friend';
import { useFriends } from '../../../features/friends';
import { useFilterControls } from '../../../shared/hooks';
import {
  ErrorBoundary,
  PageLayout,
  SectionCard,
  Toolbar,
} from '../../../shared/ui';
import { FriendsGrid } from '../../../widgets/friends-list';

/**
 * Страница друзей – отображает каталог друзей с фильтрацией.
 *
 * @param {Object} props
 * @param {string} props.searchQuery - поисковый запрос для загрузки друзей
 */
export const FriendsPage = ({ searchQuery = '' }) => {
  /** Управление фильтрацией */
  const { filter, handleFilterChange } = useFilterControls({
    initialFilter: 'all',
  });

  /** Загрузка друзей */
  const {
    friends,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
    follow,
    unfollow,
    accept,
    block,
    unlock,
    refetch,
  } = useFriends({ filter, searchQuery });

  return (
    <ErrorBoundary>
      <PageLayout title="Друзья">
        <SectionCard>
          <Toolbar
            tabs={FRIEND_CATEGORIES}
            activeTab={filter}
            onTabChange={handleFilterChange}
          />
          <FriendsGrid
            filter={filter}
            friends={friends}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            hasMore={hasMore}
            loadMore={loadMore}
            onRetry={refetch}
            onFollow={follow}
            onUnfollow={unfollow}
            onAccept={accept}
            onUnlock={unlock}
            onBlock={block}
          />
        </SectionCard>
      </PageLayout>
    </ErrorBoundary>
  );
};
