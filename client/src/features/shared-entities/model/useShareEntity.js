import { useCallback } from 'react';

/**
 * Универсальный хук подготовки сущности к шарингу.
 *
 * @param {Object} params
 * @param {Function} params.normalizeFn - функция нормализации сущности
 * @param {string} [params.storageKey='sharedEntity'] - ключ sessionStorage
 * @param {Function} [params.onSuccess] - вызывается после успешного сохранения
 *
 * @returns {{
 *   shareEntity: (entity:Object)=>void,
 *   clearSharedEntity: ()=>void,
 *   getSharedEntity: ()=>Object|null
 * }}
 */
export const useShareEntity = ({
  normalizeFn,
  storageKey = 'sharedEntity',
  onSuccess,
}) => {
  /** Сохранить сущность в sessionStorage.*/
  const shareEntity = useCallback(
    (entity) => {
      if (!entity) return;

      const normalized = normalizeFn ? normalizeFn(entity) : entity;

      sessionStorage.setItem(storageKey, JSON.stringify(normalized));

      onSuccess?.(normalized);
    },
    [normalizeFn, storageKey, onSuccess]
  );

  /** Получить сущность из sessionStorage.*/
  const getSharedEntity = useCallback(() => {
    return sessionStorage.getItem(storageKey);
  }, [storageKey]);

  /** Очистить сущность из sessionStorage.*/
  const clearSharedEntity = useCallback(() => {
    sessionStorage.removeItem(storageKey);
  }, [storageKey]);

  return {
    shareEntity,
    getSharedEntity,
    clearSharedEntity,
  };
};
