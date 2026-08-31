import { calculateAge } from '../../../shared/utils';

/**
 * Функция для отображения полей с данными пользователя на странице профиля.
 *
 * @param {Object} user - данные пользователя
 * @returns {Array<Object>} - массив характеристик
 */

export const getProfileFields = (user) => {
  if (!user || user?.canSeeFullProfile === false) return [];
  return [
    { label: 'Возраст:', value: calculateAge(user.birthDate) },
    { label: 'Email:', value: user.email },
    { label: 'Город:', value: user.address },
    { label: 'Работа:', value: user.job },
    { label: 'Статус:', value: user.status },
    { label: 'Телефон:', value: user.phone },
  ].filter(
    (field) =>
      field.value !== undefined && field.value !== null && field.value !== ''
  );
};
