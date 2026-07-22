/**
 * Получение действий профиля.
 *
 * @param {Object} friendshipButton - конфигурация кнопки действия над дружбой
 * @param {Function} onMessage - обработчик клика по кнопке "Написать сообщение"
 * @param {boolean} isOwnProfile - флаг, определяющий, является ли текущий пользователь владельцем профиля
 * @returns {Array<Object>} - массив действий профиля
 */

export const getProfileActions = (
  friendshipButton,
  onMessage,
  isOwnProfile
) => {
  if (!friendshipButton && !onMessage) return [];

  const actions = [
    !isOwnProfile &&
      friendshipButton && {
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

  return actions.filter(Boolean);
};
