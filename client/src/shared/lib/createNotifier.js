import { MESSAGES } from '../config';

/**
 * Подставляет переменные в шаблонную строку.
 * @param {string} template - шаблон сообщения
 * @param {object} data - дополнительные данные для интерполяции
 * @returns {string}
 */
const interpolate = (template, data) => {
  if (!data || !template) return template;
  return template.replace(/\${(\w+)}/g, (_, key) => data[key] ?? '');
};

/**
 * Создаёт объект для показа уведомлений, связанных с конкретной сущностью.
 * @param {object} toast - объект для показа уведомлений
 * @returns {object} - объект с методами
 */
export const createNotifier = (toast) => {

  const notifier = {
    success: (key = 'default', extra) => {
      const message = MESSAGES.success?.[key] || key;
      toast.success?.(interpolate(message, extra));
    },

    error: (key = 'default', extra) => {
      const message = MESSAGES.error?.[key] || key;
      toast.error?.(interpolate(message, extra));
    },

    warning: (key = 'default', extra) => {
      const message = MESSAGES.warning?.[key] || key;
      toast.warning?.(interpolate(message, extra));
    },

    info: (key = 'default', extra) => {
      const message = MESSAGES.info?.[key] || key;
      toast.info?.(interpolate(message, extra));
    },

    /**
     * Создаёт обработчики onSuccess/onError для типовых операций.
     * @param {string} action - ключ операции: 'add', 'update', 'delete', 'like', 'load'
     * @param {object} [callbacks] - дополнительные колбэки { onSuccess, onError }
     * @returns {{ onSuccess: Function, onError: Function }}
     */
    createHandlers: (action, callbacks = {}) => ({
      onSuccess: (data) => {
        notifier.success(action);
        callbacks.onSuccess?.(data);
      },
      onError: (err) => {
        notifier.error(action, { error: err?.message || '' });
        callbacks.onError?.(err);
      },
    }),
  };

  return notifier;
};
