/**
 * Действия на карточке профиля (дружба + сообщение).
 *
 * @param {Object} params
 * @param {boolean} params.isOwnProfile - является ли профиль своим
 * @param {Object|null} params.friendshipButton - конфигурация кнопки дружбы из getFriendshipButtonConfig
 * @param {Function} [params.onSendMessage] - функция для отправки сообщения
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
