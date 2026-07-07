/**
 * Выполняет действие при активации элемента клавиатурой.
 *
 * Используется для элементов с role="button".
 *
 * @param {KeyboardEvent} event
 * @param {Function} callback
 */

export const handleKeyboardClick = (event, callback) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback?.();
  }
};
