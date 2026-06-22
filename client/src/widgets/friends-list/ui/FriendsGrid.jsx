import style from './FriendsGrid.module.css';
import { FriendCard } from '../../../entities/friend';
import { Pagination } from '../../../shared/ui';

/**
 * Сетка карточек друзей с пагинацией.
 * @param {Object} props
 * @param {Array} props.friends - список друзей с полями _friendshipStatus и _friendshipDirection
 * @param {Function} props.onFollow
 * @param {Function} props.onUnfollow
 * @param {Function} props.onAccept
 * @param {Function} props.onUnlock
 * @param {Function} props.onBlock
 * @param {Function} props.onUserClick - возвращает функцию-обработчик для клика по пользователю
 * @param {Object} props.pagination
 */
export const FriendsGrid = ({
  friends,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
  onUserClick,
  pagination,
  currentUserId,
}) => {
  if (!friends?.length) return null;

  return (
    <>
      <div className={style.friendsGrid}>
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            currentUserId={currentUserId}
            friendshipStatus={friend._friendshipStatus}
            friendshipDirection={friend._friendshipDirection}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onAccept={onAccept}
            onUnlock={onUnlock}
            onBlock={onBlock}
            onClick={onUserClick}
          />
        ))}
      </div>
      {pagination?.totalPages > 1 && (
        <Pagination
          totalPages={pagination.totalPages}
          page={pagination.currentPage}
          onPageChange={pagination.goToPage}
        />
      )}
    </>
  );
};
