/**
 * Возвращает параметры StatusBadge
 *
 * @param {string} status - Статус дружбы
 * @param {string} direction - Направление дружбы
 */
export const getFriendshipBadge = (status, direction) => {
  switch (status) {
    case 'accepted':
      return {
        status: 'success',
        label: 'В друзьях',
      };

    case 'pending':
      return direction === 'incoming'
        ? {
            status: 'warning',
            label: 'Входящая заявка',
          }
        : {
            status: 'info',
            label: 'Исходящая заявка',
          };

    case 'blocked':
      return direction === 'incoming'
        ? {
            status: 'error',
            label: 'Вы заблокировали',
          }
        : {
            status: 'error',
            label: 'Вы заблокированы',
          };

    default:
      return null;
  }
};
