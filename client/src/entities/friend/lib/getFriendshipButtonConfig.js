/**
 * Определяет конфигурацию кнопки действий с дружбой на основе текущего статуса.
 * Возвращает объект, готовый для передачи в пропсы компонента Button.
 *
 * @param {Object} params
 * @param {Object} params.friend - пользователь/друг
 * @param {Function} params.onFollow - функция отправки заявки в друзья
 * @param {Function} params.onUnfollow - функция отмены заявки или удаления из друзей
 * @param {Function} params.onAccept - функция принятия входящей заявки
 * @param {Function} params.onUnlock - функция разблокировки пользователя
 * @param {Function} params.onBlock - функция блокировки пользователя
 *
 * @returns {Object} { text, hoverText, variant, action, disabled }
 */
export const getFriendshipButtonConfig = ({
  friend,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  if (!friend?.id) return null;

  let config = {
    text: 'Добавить в друзья',
    hoverText: 'Отправить заявку',
    variant: 'primary',
    action: () => onFollow?.(friend.id),
    disabled: false,
  };

  if (friend.friendshipStatus === 'accepted') {
    config = {
      text: 'В друзьях',
      hoverText: 'Заблокировать',
      variant: 'secondary',
      action: () => onBlock?.(),
      disabled: false,
    };
  } else if (friend.friendshipStatus === 'pending') {
    if (friend.friendshipDirection === 'incoming') {
      config = {
        text: 'Новая заявка',
        hoverText: 'Принять заявку',
        variant: 'primary',
        action: () => onAccept?.(friend.friendshipId, friend.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Заявка отправлена',
        hoverText: 'Отменить',
        variant: 'ghost',
        action: () => onUnfollow?.(friend.friendshipId, friend.id),
        disabled: false,
      };
    }
  } else if (friend.friendshipStatus === 'blocked') {
    if (friend.friendshipDirection === 'incoming') {
      config = {
        text: 'Заблокирован',
        hoverText: 'Разблокировать',
        variant: 'ghost',
        action: () => onAccept?.(friend.friendshipId, friend.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Вас заблокировали',
        hoverText: 'Удалить',
        variant: 'ghost',
        action: () => onUnlock?.(friend.friendshipId, friend.id),
        disabled: false,
      };
    }
  }

  return config;
};
