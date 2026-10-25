import { calculateAge } from '../../../shared/utils';

/**
 * Возвращает поля профиля.
 *
 * @param {Object} user - Данные пользователя
 * @returns {Array<Object>} Поля профиля
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
