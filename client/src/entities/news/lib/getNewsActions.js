import { formatViews } from '../../../shared/lib';

/**
 * Формирует массив действий для карточки новости.
 *
 * @param {Object} params
 * @param {Object} params.news - данные новости
 * @param {Object} params.currentUser - текущий пользователь
 * @param {(id:number,isLiked:boolean)=>void} params.toggleLike - функция для лайка/дизлайка новости (id: номер новости, isLiked: boolean)
 * @param {(id:number)=>void} params.toggleComments - функция для открытия комментариев новости (id: номер новости)
 * @param {(id:number)=>void} params.onDelete - функция для удаления новости (id: номер новости)
 * @param {(id:number)=>void} params.onUpdate - функция для обновления новости (id: номер новости)
 * @param {Function} params.onShare - переход на страницу сообщений для передачи новости
 * @returns {Array<Object>} - массив действий карточки новости
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

      onClick: () => onDelete?.(news.id),
    });
  }

  return actions;
};
