import { calculateAge } from '../../../shared/utils';

/**
 * Возвращает информацию о друге
 *
 * @param {Object} friend - данные друга
 * @returns {Array<Object>} - массив информации о друге
 */

export const getFriendDetails = (friend) => {
  if (!friend) return [];
  return [
    {
      label: 'Возраст',
      value: calculateAge(friend.birthDate),
    },
    {
      label: 'Адрес',
      value: friend.address,
    },
    {
      label: 'Работа',
      value: friend.job,
    },
    {
      label: 'Статус',
      value: friend.status,
    },
  ].filter(
    (field) =>
      field.value !== undefined && field.value !== null && field.value !== ''
  );
};
