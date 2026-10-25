import { MESSAGES } from '../config';

/**
 * Подставляет значения в шаблон сообщения.
 *
 * @param {string} template - Шаблон с подстановками
 * @param {Object} [data] - Значения для подстановки
 * @returns {string} Сообщение с подставленными значениями.
 */
const interpolate = (template, data) => {
  if (!data || !template) return template;
  return template.replace(/\${(\w+)}/g, (_, key) => data[key] ?? '');
};

/**
 * Создаёт методы показа уведомлений по ключам сообщений.
 *
 * @param {Object} toast - Методы показа уведомлений
 * @param {Function} [toast.success] - Показывает успех
 * @param {Function} [toast.error] - Показывает ошибку
 * @param {Function} [toast.warning] - Показывает предупреждение
 * @param {Function} [toast.info] - Показывает информацию
 * @returns {{
 *   success: Function,
 *   error: Function,
 *   warning: Function,
 *   info: Function,
 *   createHandlers: Function
 * }} Методы уведомлений и пара обработчиков.
 */
export const createNotifier = (toast) => {

  const notifier = {
    /**
     * Показывает уведомление об успехе.
     *
     * @param {string} [key='default'] - Ключ сообщения
     * @param {Object} [extra] - Значения для подстановки
     * @returns {void}
     */
    success: (key = 'default', extra) => {
      const message = MESSAGES.success?.[key] || key;
      toast.success?.(interpolate(message, extra));
    },

    /**
     * Показывает уведомление об ошибке.
     *
     * @param {string} [key='default'] - Ключ сообщения
     * @param {Object} [extra] - Значения для подстановки
     * @returns {void}
     */
    error: (key = 'default', extra) => {
      const message = MESSAGES.error?.[key] || key;
      toast.error?.(interpolate(message, extra));
    },

    /**
     * Показывает предупреждение.
     *
     * @param {string} [key='default'] - Ключ сообщения
     * @param {Object} [extra] - Значения для подстановки
     * @returns {void}
     */
    warning: (key = 'default', extra) => {
      const message = MESSAGES.warning?.[key] || key;
      toast.warning?.(interpolate(message, extra));
    },

    /**
     * Показывает информационное уведомление.
     *
     * @param {string} [key='default'] - Ключ сообщения
     * @param {Object} [extra] - Значения для подстановки
     * @returns {void}
     */
    info: (key = 'default', extra) => {
      const message = MESSAGES.info?.[key] || key;
      toast.info?.(interpolate(message, extra));
    },

    /**
     * Возвращает обработчики успеха и ошибки для операции.
     *
     * @param {string} action - Ключ сообщения
     * @param {Object} [callbacks={}] - Дополнительные обработчики
     * @param {Function} [callbacks.onSuccess] - Вызывается после успеха
     * @param {Function} [callbacks.onError] - Вызывается при ошибке
     * @returns {{ onSuccess: Function, onError: Function }} Обработчики результата.
     */
    createHandlers: (action, callbacks = {}) => ({
      /**
       * Показывает успех и вызывает дополнительный обработчик.
       *
       * @param {*} data - Данные успешного результата
       * @returns {void}
       */
      onSuccess: (data) => {
        notifier.success(action);
        callbacks.onSuccess?.(data);
      },
      /**
       * Показывает ошибку и вызывает дополнительный обработчик.
       *
       * @param {Error} err - Ошибка операции
       * @returns {void}
       */
      onError: (err) => {
        notifier.error(action, { error: err?.message || '' });
        callbacks.onError?.(err);
      },
    }),
  };

  return notifier;
};
