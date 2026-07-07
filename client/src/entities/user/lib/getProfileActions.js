/**
 * Получение действий профиля.
 *
 * @param {Object} params
 * @param {Object} params.friendshipButton
 * @param {Function} params.onMessage
 * @param {boolean} params.isOwnProfile
 *
 * @returns {Array<Object>}
 */

export const getProfileActions = ({
  friendshipButton,
  onMessage,
  isOwnProfile,
}) =>{
  if (!friendshipButton && !onMessage) return [];

  const actions = [
    !isOwnProfile && friendshipButton && {
      key: 'friendship',
      ...friendshipButton,
    },
    {
      key: 'message',
      text: 'Написать сообщение',
      variant: 'secondary',
      onClick: onMessage, 
    },
  ];

  return actions;
};