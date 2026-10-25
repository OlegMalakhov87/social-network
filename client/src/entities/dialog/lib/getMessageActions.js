/**
 * Возвращает действия сообщения.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.message - Сообщение
 * @param {boolean} params.isOwn - Является ли сообщение владельцем
 * @param {Object} params.sharedEntity - Общая сущность
 * @param {Function} [params.handleStartEdit] - Обработчик начала правки
 * @param {Function} [params.onDelete] - Обработчик удаления
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.onShare] - Обработчик отправки
 * @returns {Array<Object>} Действия сообщения
 */
export const getMessageActions = ({
  message,
  isOwn,
  sharedEntity,
  handleStartEdit,
  onDelete,
  toggleLike,
  onShare,
}) => {
  if (!message) return [];

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
      label: '',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    },
  ];

  if (isOwn && !sharedEntity) {
    actions.push({
      key: 'edit',
      icon: '✏️',
      label: '',
      ariaLabel: 'Редактировать сообщение',
      onClick: () => handleStartEdit?.(),
    });
  }
  if (isOwn) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: '',
      ariaLabel: 'Удалить сообщение',
      onClick: () => onDelete?.(),
    });
  }

  return actions;
};
