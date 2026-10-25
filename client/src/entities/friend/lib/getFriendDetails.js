import { calculateAge } from '../../../shared/utils';

/**
 * Возвращает сведения о друге.
 *
 * @param {Object} friend - Данные друга
 * @returns {Array<Object>} Сведения о друге
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
