import { formatViews } from '../../../shared/utils';

/**
 * Возвращает действия новости.
 *
 * @param {Object} params - Параметры действий
 * @param {Object} params.news - Новость
 * @param {Object} params.currentUser - Текущий пользователь
 * @param {Function} [params.toggleLike] - Обработчик лайка
 * @param {Function} [params.toggleComments] - Обработчик комментариев
 * @param {Function} [params.onDelete] - Обработчик удаления
 * @param {Function} [params.onUpdate] - Обработчик обновления
 * @param {Function} [params.onShare] - Обработчик отправки
 * @returns {Array<Object>} Действия новости
 */
export const getNewsActions = ({
  news,
  currentUser,
  toggleLike,
  toggleComments,
  onDelete,
  onUpdate,
  onShare,
}) => {
  if (!news) return [];

  const isAdmin = currentUser?.isAdmin;
  const isAuthor = currentUser?.id === news.uploadedBy;

  const actions = [
    {
      key: 'like',
      icon: news.isLiked ? '❤️' : '🤍',
      label: String(news.likesCount ?? 0),
      ariaLabel: news.isLiked ? 'Убрать лайк' : 'Поставить лайк',
      onClick: () => toggleLike?.(news.id, news.isLiked),
    },
    {
      key: 'comments',
      icon: '💬',
      label: String(news.commentsCount ?? 0),
      ariaLabel: 'Комментировать',
      onClick: () => toggleComments?.(news.id),
    },
    {
      key: 'share',
      icon: '↗️',
      label: '',
      ariaLabel: 'Поделиться',
      onClick: () => onShare?.(),
    },
    {
      key: 'views',
      icon: '👁️',
      label: String(formatViews(news.viewsCount ?? 0)),
      ariaLabel: 'Просмотры',
    },
  ];

  if (isAdmin || isAuthor) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: '',
      ariaLabel: 'Обновить новость',
      onClick: () => onUpdate?.(news),
    });
  }

  if (isAdmin || isAuthor) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: '',
      ariaLabel: 'Удалить новость',
      onClick: () => onDelete?.(),
    });
  }

  return actions;
};
