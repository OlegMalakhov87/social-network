/**
 * Получить пропсы для кнопки действия с дружбой.
 * @param {Object} params
 * @param {string} params.friendshipStatus
 * @param {string} params.friendshipDirection
 * @param {Function} params.onFollow
 * @param {Function} params.onUnfollow
 * @param {Function} params.onAccept
 * @param {Function} params.onUnlock
 * @param {Function} params.onBlock
 * @returns {{ text: string, hoverText: string, className: string, action: Function }}
 */
export const getButtonProps = ({
  friendshipStatus,
  friendshipDirection,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  if (friendshipStatus === 'accepted') {
    return {
      text: '✓ У вас в друзьях',
      hoverText: '🗑️ Удалить из друзей',
      className: 'friend',
      action: onBlock,
    };
  }

  if (friendshipStatus === 'pending') {
    if (friendshipDirection === 'incoming') {
      return {
        text: '+ Новая заявка в друзья',
        hoverText: '✓ Принять',
        className: 'accept',
        action: onAccept,
      };
    }
    return {
      text: '✓ Заявка в друзья отправлена',
      hoverText: '✕ Отменить заявку',
      className: 'requestSent',
      action: onUnfollow,
    };
  }

  if (friendshipStatus === 'blocked') {
    if (friendshipDirection === 'incoming') {
      return {
        text: 'Вы заблокировали',
        hoverText: 'Разблокировать',
        className: 'blockedMe',
        action: onAccept,
      };
    }
    return {
      text: '🔓 Вас заблокировали',
      hoverText: '✕ Отменить заявку',
      className: 'blockedByMe',
      action: onUnlock,
    };
  }

  return {
    text: '+ Добавить в друзья',
    hoverText: '+ Добавить в друзья',
    className: 'follow',
    action: onFollow,
  };
};
