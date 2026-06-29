import { useMemo } from 'react';

/**
 * Возвращает конфигурацию кнопки дружбы.
 *
 * @param {Object} params
 * @param {Object} params.targetUser
 * @param {Object} params.currentUser
 * @param {string} params.friendshipStatus
 * @param {string} params.friendshipDirection
 * @param {number|null} params.friendshipId
 * @param {Function} params.onFollow
 * @param {Function} params.onUnfollow
 * @param {Function} params.onAccept
 * @param {Function} params.onUnlock
 * @param {Function} params.onBlock
 */

export const useFriendshipButton = ({
  targetUser,
  currentUser,
  friendshipStatus,
  friendshipDirection,
  friendshipId,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  return useMemo(() => {
    if (!targetUser?.id) return null;

    if (targetUser?.id === currentUser?.id) {
      return null;
    }

    switch (friendshipStatus) {
      case 'accepted':
        return {
          text: 'В друзьях',
          hoverText: 'Заблокировать',
          variant: 'friend',
          onClick: () => onBlock(targetUser?.id),
        };

      case 'pending':
        if (friendshipDirection === 'incoming') {
          return {
            text: 'Новая заявка',
            hoverText: 'Принять заявку',
            variant: 'accept',
            onClick: () => onAccept(friendshipId, targetUser?.id),
          };
        }

        return {
          text: 'Заявка отправлена',
          hoverText: 'Отменить',
          variant: 'requestSent',
          onClick: () => onUnfollow(friendshipId, targetUser?.id),
        };

      case 'blockedMe':
        return {
          text: 'Разблокирован',
          hoverText: 'Разблокировать',
          variant: 'blockedMe',
          onClick: () => onAccept(friendshipId, targetUser?.id),
        };

      case 'blockedByMe':
        return {
          text: 'Вы заблокированы',
          hoverText: 'Удалить',
          variant: 'blockedByMe',
          onClick: () => onUnlock(friendshipId, targetUser?.id),
        };

      default:
        return {
          text: 'Добавить в друзья',
          hoverText: 'Отправить заявку',
          variant: 'follow',
          onClick: () => onFollow(targetUser?.id),
        };
    }
  }, [
    friendshipStatus,
    friendshipDirection,
    friendshipId,
    targetUser,
    currentUser,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock,
  ]);
};
