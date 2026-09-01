/**
 * Форматирует телефонный номер в формате +7 (XXX) XXX-XX-XX.
 *
 * @param {string} value - Телефонный номер
 * @returns {string} - Форматированный телефонный номер
 */
export const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';

  let result = '+7';

  if (digits.length > 1) {
    result += ' (' + digits.slice(1, 4);
  }
  if (digits.length >= 5) {
    result += ') ' + digits.slice(4, 7);
  }
  if (digits.length >= 8) {
    result += '-' + digits.slice(7, 9);
  }
  if (digits.length >= 10) {
    result += '-' + digits.slice(9, 11);
  }

  return result;
};
