import { formatViews } from '../../../shared/lib';

/**
 * Формирует массив действий для карточки новости.
 *
 * @param {Object} params - параметры
 * @param {Object} params.news - данные новости
 * @param {Object} params.currentUser - текущий пользователь
 * @param {Function} params.toggleLike - функция для лайка/дизлайка новости (id: номер новости, isLiked: boolean)
 * @param {Function} params.toggleComments - функция для открытия комментариев новости
 * @param {Function} params.onDelete - функция для удаления новости
 * @param {Function} params.onUpdate - функция для обновления новости
 * @param {Function} params.onShare - переход на страницу сообщений для передачи новости
 * @returns {Array<Object>} - массив действий для карточки новости
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
      label: 'Поделиться',
      ariaLabel: 'Поделиться',

      onClick: () => onShare?.(),
    },
    {
      key: 'views',
      icon: '👁️',
      label: String(formatViews(news.viewCount ?? 0)),
      ariaLabel: 'Просмотры',
      disabled: true,
    },
  ];

  if (isAdmin || isAuthor) {
    actions.push({
      key: 'update',
      icon: '✏️',
      label: 'Обновить',
      ariaLabel: 'Обновить новость',

      onClick: () => onUpdate?.(news),
    });
  }

  if (isAdmin || isAuthor) {
    actions.push({
      key: 'delete',
      icon: '🗑️',
      label: 'Удалить',
      ariaLabel: 'Удалить новость',

      onClick: () => onDelete?.(),
    });
  }

  return actions;
};
