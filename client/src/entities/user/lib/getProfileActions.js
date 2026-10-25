/**
 * Возвращает действия карточки профиля.
 *
 * @param {Object} params - Параметры действий
 * @param {boolean} params.isOwnProfile - Признак своего профиля
 * @param {Object|null} params.friendshipButton - Конфигурация кнопки дружбы
 * @param {Function} [params.onSendMessage] - Обработчик отправки сообщения
 * @returns {Array<Object>} Действия профиля
 */
export const getProfileActions = ({
  isOwnProfile,
  friendshipButton,
  onSendMessage,
}) => {
  if (isOwnProfile) return [];

  const actions = [];

  if (friendshipButton) {
    actions.push({
      key: 'friendship',
      text: friendshipButton.text,
      hoverText: friendshipButton.hoverText,
      variant: friendshipButton.variant,
      onClick: friendshipButton.action,
    });
  }

  if (onSendMessage) {
    actions.push({
      key: 'message',
      text: 'Написать сообщение',
      hoverText: 'Отправить сообщение',
      variant: 'secondary',
      onClick: onSendMessage,
    });
  }

  return actions;
};
