/**
 * Возвращает конфигурацию кнопки дружбы.
 *
 * @param {Object} params - Параметры кнопки
 * @param {Object} [params.user] - Пользователь
 * @param {Function} [params.onFollow] - Обработчик заявки в друзья
 * @param {Function} [params.onUnfollow] - Обработчик удаления из друзей
 * @param {Function} [params.onAccept] - Обработчик принятия заявки
 * @returns {Object|null} Конфигурация кнопки
 */
export const getFriendshipButtonConfig = ({
  user,
  onFollow,
  onUnfollow,
  onAccept,
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
      hoverText: 'Удалить из друзей',
      variant: 'secondary',
      action: () => onUnfollow?.(user.friendshipId, user.id),
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
        action: () => onUnfollow?.(user.friendshipId, user.id),
        disabled: false,
      };
    } else {
      config = {
        text: 'Вас заблокировали',
        hoverText: 'Действие не доступно',
        variant: 'ghost',
        action: () => {},
        disabled: true,
      };
    }
  }

  return config;
};
