/**
 * Возвращает возраст в полных годах.
 *
 * @param {string} birthday - Дата рождения
 * @returns {number|null} Полных лет или null, если дата пуста или некорректна.
 */
export const calculateAge = (birthday) => {
  if (!birthday) return null;

  const birthDate = new Date(birthday);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
