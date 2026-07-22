/**
 * Функция для конвертации даты рождения в возраст
 *
 * @param {string} birthday - дата рождения
 * @returns {number} - возраст
 */
export const calculateAge = (birthday) => {
  if (!birthday) return;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};
