/**
 * Возвращает информацию о друге
 *
 * @param {Object} friend - данные друга
 * @returns {Array<Object>} - массив информации о друге
 */

export const getFriendDetails = (friend) => {
  return [
    {
      label: 'Возраст',
      value: friend.age || '—',
    },
    {
      label: 'Город',
      value: friend.city || '—',
    },
    {
      label: 'Работа',
      value: friend.job || '—',
    },
    {
      label: 'Статус',
      value: friend.status || '—',
    },
  ];
};
