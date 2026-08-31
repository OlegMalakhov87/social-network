/**
 * Определяет конфигурацию кнопки действий с дружбой.
 *
 * @param {Object} params
 * @param {Object} [params.user] - пользователь
 * @param {Function} [params.onFollow] - функция для отправки заявки в друзья
 * @param {Function} [params.onUnfollow] - функция для удаления заявки в друзья
 * @param {Function} [params.onAccept] - функция для принятия заявки в друзья
 * @param {Function} [params.onUnlock] - функция для разблокировки пользователя
 * @param {Function} [params.onBlock] - функция для блокировки пользователя
 */
export const getFriendshipButtonConfig = ({
  user,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  if (!user?.id) return null;

  let config = {
    text: 'Добавить в друзья',
    hoverText: 'Отправить заявку',
    variant: 'primary',
    action: () => onFollow?.(user.id),
    disabled: false,
  };

  if (user.friendshipStatus === 'accepted') {
    config = {
      text: 'В друзьях',
      hoverText: 'Заблокировать',
      variant: 'secondary',
      action: () => onBlock?.(user.id),
      disabled: false,
    };
  } else if (user.friendshipStatus === 'pending') {
    if (user.friendshipDirection === 'incoming') {
      config = {
        text: 'Новая заявка',
        hoverText: 'Принять заявку',
        variant: 'primary',
        action: () => onAccept?.(user.friendshipId, user.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Заявка отправлена',
        hoverText: 'Отменить',
        variant: 'ghost',
        action: () => onUnfollow?.(user.friendshipId, user.id),
        disabled: false,
      };
    }
  } else if (user.friendshipStatus === 'blocked') {
    if (user.friendshipDirection === 'incoming') {
      config = {
        text: 'Заблокирован',
        hoverText: 'Разблокировать',
        variant: 'ghost',
        action: () => onUnlock?.(user.friendshipId, user.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Вас заблокировали',
        hoverText: 'Удалить из друзей',
        variant: 'ghost',
        action: () => onUnlock?.(user.friendshipId, user.id),
        disabled: false,
      };
    }
  }

  return config;
};
