import { useCallback } from 'react';

/**
 * Сохраняет сущность для отправки и читает её из sessionStorage.
 *
 * @param {Object} params - Параметры сохранения
 * @param {Function} [params.normalizeFn] - Нормализует сущность перед сохранением
 * @param {string} [params.storageKey='sharedEntity'] - Ключ sessionStorage
 * @param {Function} [params.onSuccess] - Обработчик успешного сохранения
 * @returns {{
 *   shareEntity: Function,
 *   getSharedEntity: Function,
 *   clearSharedEntity: Function
 * }} Действия с сохранённой сущностью
 */
export const useShareEntity = ({
  normalizeFn,
  storageKey = 'sharedEntity',
  onSuccess,
}) => {
  /**
   * Сохраняет сущность в sessionStorage.
   *
   * @param {Object} entity - Сущность для отправки
   * @returns {void}
   */
  const shareEntity = useCallback(
    (entity) => {
      if (!entity) return;

      const normalized = normalizeFn ? normalizeFn(entity) : entity;

      sessionStorage.setItem(storageKey, JSON.stringify(normalized));

      onSuccess?.(normalized);
    },
    [normalizeFn, storageKey, onSuccess]
  );

  const getSharedEntity = useCallback(() => {
    return sessionStorage.getItem(storageKey);
  }, [storageKey]);

  const clearSharedEntity = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    shareEntity,
    getSharedEntity,
    clearSharedEntity,
  };
};
