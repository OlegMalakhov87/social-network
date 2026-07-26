import { MESSAGES, getEntityName } from '../config';

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
 * @param {string} [entity] - тип сущности
 * @returns {object} - объект с методами
 */
export const createNotifier = (toast, entity = null) => {
  const entityName = entity ? getEntityName(entity) : null;

  const getMessage = (type, key, extra) => {
    let message;

    if (entityName && MESSAGES[type]?.[`${entity}.${key}`]) {
      message = MESSAGES[type][`${entity}.${key}`];
    } else if (MESSAGES[type]?.[key]) {
      message = MESSAGES[type][key];
    } else {
      message = MESSAGES[type]?.default || 'Что-то пошло не так';
    }

    return interpolate(message, extra);
  };

  const notifier = {
    success: (key = 'default', extra) => {
      toast.success?.(getMessage('success', key, extra));
    },

    error: (key = 'default', extra) => {
      toast.error?.(getMessage('error', key, extra));
    },

    warning: (key = 'default', extra) => {
      toast.warning?.(getMessage('warning', key, extra));
    },

    info: (key = 'default', extra) => {
      toast.info?.(getMessage('info', key, extra));
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
