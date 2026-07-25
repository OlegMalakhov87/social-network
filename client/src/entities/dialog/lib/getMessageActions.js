/**
 * Конфигурация элементов управления сообщением.
 *
 * @param {Object} params - параметры
 * @param {Object} params.message - данные сообщения
 * @param {string} params.currentUserId - ID текущего пользователя
 * @param {Object} params.sharedEntity - данные общей сущности
 * @param {Function} params.handleStartEdit - функция для начала редактирования сообщения
 * @param {Function} params.onDelete - функция для удаления сообщения
 * @param {Function} params.toggleLike - функция для лайка/дизлайка сообщения
 * @param {Function} params.onShare - функция для перехода на страницу сообщений для передачи сообщения
 * @returns {Array<Object>} - массив действий для сообщения
 */
export const getMessageActions = ({
  message,
  currentUserId,
  sharedEntity,
  handleStartEdit,
  onDelete,
  toggleLike,
  onShare,
}) => {
  if (!message) return [];

  const isOwn = message.senderId === currentUserId;

  const actions = [
    {
      key: 'like',
      icon: message.isLiked ? '❤️' : '🤍',
      label: String(message.likesCount ?? 0),
      ariaLabel: message.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(message.id, message.isLiked),
    },
    {
      key: 'share',
      icon: '↗️',
      label: 'Поделиться',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    },
  ];

  if (isOwn && !sharedEntity) {
    actions.push({
      key: 'edit',
      icon: '✏️',
      label: 'Редактировать',
      ariaLabel: 'Редактировать сообщение',
      onClick: () => handleStartEdit?.(),
    });
  }
  if (isOwn) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: 'Удалить',
      ariaLabel: 'Удалить сообщение',
      onClick: () => onDelete?.(),
    });
  }

  return actions;
};
