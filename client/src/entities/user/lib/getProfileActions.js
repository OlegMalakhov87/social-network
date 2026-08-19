/**
 * Действия на карточке профиля (дружба + сообщение).
 *
 * @param {Object} params
 * @param {boolean} params.isOwnProfile
 * @param {Object|null} params.friendshipButton - из getFriendshipButtonConfig
 * @param {Function} [params.onMessage]
 */
export const getProfileActions = ({
  isOwnProfile,
  friendshipButton,
  onMessage,
}) => {
  if (isOwnProfile) return [];

  const actions = [];

  if (friendshipButton) {
    actions.push({
      key: 'friendship',
      text: friendshipButton.text,
      variant: friendshipButton.variant,
      onClick: friendshipButton.action,
    });
  }

  if (onMessage) {
    actions.push({
      key: 'message',
      text: 'Написать сообщение',
      variant: 'secondary',
      onClick: onMessage,
    });
  }

  return actions;
};
