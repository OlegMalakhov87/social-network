/**
 * Функция для выполнения действия при активации элемента клавиатурой.
 *
 * @param {KeyboardEvent} event - событие клавиатуры
 * @param {Function} callback - функция для выполнения действия
 */

export const handleKeyboardClick = (event, callback) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback?.();
  }
};
