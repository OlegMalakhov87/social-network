/**
 * Вызывает обработчик при нажатии Enter или пробела.
 *
 * @param {KeyboardEvent} event - Событие клавиатуры
 * @param {Function} callback - Обработчик активации
 * @returns {void}
 */
export const handleKeyboardClick = (event, callback) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback?.();
  }
};
