/**
 * Вычисляет возраст по дате рождения.
 *
 * @param {string} birthday - дата рождения
 * @returns {number|null} - возраст или null при некорректных данных
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
