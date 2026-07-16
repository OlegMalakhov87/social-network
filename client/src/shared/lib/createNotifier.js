import { MESSAGES, getEntityName } from '../config';

/**
 * Подставляет переменные в шаблонную строку.
 * @param {string} template - шаблон сообщения
 * @param {object} data - дополнительные данные для интерполяции
 * @returns {string} - сообщение с интерполированными данными
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

  /**
   * Получает сообщение по типу и ключу.
   * Сначала ищет специфичное для сущности, потом общее, потом default.
   * @param {string} type - тип уведомления
   * @param {string} key - ключ сообщения
   * @param {object} extra - дополнительные данные для интерполяции
   * @returns {string} - сообщение
   */
  const getMessage = (type, key, extra) => {
    let message = null;

    // Пробуем найти специфичное для сущности
    if (entityName && MESSAGES[type]?.[`${entity}.${key}`]) {
      message = MESSAGES[type][`${entity}.${key}`];
    }
    // Пробуем найти общее сообщение по ключу
    else if (MESSAGES[type]?.[key]) {
      message = MESSAGES[type][key];
    }
    // Берём default
    else {
      message = MESSAGES[type]?.default || 'Что-то пошло не так';
    }

    // Подставляем переменные, если есть
    return interpolate(message, extra);
  };

  return {
    /** Показать успешное уведомление */
    success: (key = 'default', extra) => {
      const message = getMessage('success', key, extra);
      toast.success?.(message);
    },

    /** Показать ошибку */
    error: (key = 'default', extra) => {
      const message = getMessage('error', key, extra);
      toast.error?.(message);
    },

    /** Показать предупреждение */
    warning: (key = 'default', extra) => {
      const message = getMessage('warning', key, extra);
      toast.warning?.(message);
    },

    /** Показать информационное сообщение */
    info: (key = 'default', extra) => {
      const message = getMessage('info', key, extra);
      toast.info?.(message);
    },

    /**
     * Создаёт обработчики onSuccess/onError для типовых операций.
     * @param {string} action - тип операции: 'add', 'update', 'delete', 'like', 'load', 'loadMore'
     * @param {object} [callbacks] - дополнительные колбэки { onSuccess, onError }
     * @returns {object} - { onSuccess, onError }
     */
    createHandlers: (action, callbacks = {}) => {
      return {
        onSuccess: (data) => {
          this.success(action);
          callbacks.onSuccess?.(data);
        },
        onError: (err) => {
          this.error(action, { error: err?.message || '' });
          callbacks.onError?.(err);
        },
      };
    },
  };
};
