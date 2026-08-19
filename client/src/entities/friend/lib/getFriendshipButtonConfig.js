/**
 * Определяет конфигурацию кнопки действий с дружбой.
 *
 * @param {Object} params
 * @param {Object} [params.friend] - друг из списка (friendship* на объекте)
 * @param {Object} [params.targetUser] - пользователь профиля
 * @param {string|null} [params.friendshipStatus]
 * @param {string|null} [params.friendshipDirection]
 * @param {number|null} [params.friendshipId]
 */
export const getFriendshipButtonConfig = ({
  friend,
  targetUser,
  friendshipStatus,
  friendshipDirection,
  friendshipId,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  const subject =
    friend ??
    (targetUser
      ? {
          ...targetUser,
          friendshipStatus,
          friendshipDirection,
          friendshipId,
        }
      : null);

  if (!subject?.id) return null;

  let config = {
    text: 'Добавить в друзья',
    hoverText: 'Отправить заявку',
    variant: 'primary',
    action: () => onFollow?.(subject.id),
    disabled: false,
  };

  if (subject.friendshipStatus === 'accepted') {
    config = {
      text: 'В друзьях',
      hoverText: 'Заблокировать',
      variant: 'secondary',
      action: () => onBlock?.(subject.id),
      disabled: false,
    };
  } else if (subject.friendshipStatus === 'pending') {
    if (subject.friendshipDirection === 'incoming') {
      config = {
        text: 'Новая заявка',
        hoverText: 'Принять заявку',
        variant: 'primary',
        action: () =>
          onAccept?.(subject.friendshipId, subject.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Заявка отправлена',
        hoverText: 'Отменить',
        variant: 'ghost',
        action: () =>
          onUnfollow?.(subject.friendshipId, subject.id),
        disabled: false,
      };
    }
  } else if (subject.friendshipStatus === 'blocked') {
    if (subject.friendshipDirection === 'incoming') {
      config = {
        text: 'Заблокирован',
        hoverText: 'Разблокировать',
        variant: 'ghost',
        action: () =>
          onAccept?.(subject.friendshipId, subject.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Вас заблокировали',
        hoverText: 'Удалить',
        variant: 'ghost',
        action: () =>
          onUnlock?.(subject.friendshipId, subject.id),
        disabled: false,
      };
    }
  }

  return config;
};
