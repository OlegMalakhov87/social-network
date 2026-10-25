import { useCallback, useEffect, useRef } from 'react';

/**
 * Обновляет счётчик до ответа сервера и возвращает прежнее состояние при ошибке.
 *
 * @param {Object} params - Параметры счётчика
 * @param {Array} params.items - Текущие элементы
 * @param {Function} params.setItems - Обновляет массив элементов
 * @param {string} params.countField - Поле счётчика
 * @param {Function} params.updateFn - Отправляет изменение на сервер
 * @returns {{ increment: Function, decrement: Function, incrementWithApi: Function }} Методы изменения счётчика.
 */
export const useOptimisticCounter = ({
  items,
  setItems,
  countField,
  updateFn,
}) => {
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  /**
   * Меняет значение счётчика на дельту.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @param {number} delta - Изменение счётчика
   * @returns {void}
   */
  const updateCounter = useCallback(
    (itemId, delta) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;

          const currentValue = item[countField] ?? 0;
          return {
            ...item,
            [countField]: Math.max(0, currentValue + delta),
          };
        })
      );
    },
    [setItems, countField]
  );

  /**
   * Меняет счётчик до ответа сервера и возвращает прежнее состояние при ошибке.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @param {number|string|null} [libraryId=null] - Идентификатор элемента библиотеки
   * @param {number} [delta=1] - Изменение счётчика
   * @returns {Promise<boolean>} Признак успеха или false, если идентификатор пуст или сервер вернул ошибку.
   */
  const incrementWithApi = useCallback(
    async (itemId, libraryId = null, delta = 1) => {
      if (!itemId) return false;

      // Сохраняет прежнее состояние для отката.
      const oldItems = itemsRef.current;

      updateCounter(itemId, delta);

      try {
        if (updateFn) {
          const result = await updateFn(libraryId ?? itemId);

          // Записывает lastWatchedAt, если сервер его вернул.
          if (result?.lastWatchedAt) {
            setItems((prev) =>
              prev.map((item) =>
                item.id === itemId
                  ? { ...item, lastWatchedAt: result.lastWatchedAt }
                  : item
              )
            );
          }
        }
        return true;
      } catch (err) {
        // Возвращает прежнее состояние при ошибке.
        setItems(oldItems);
        return false;
      }
    },
    [setItems, updateCounter, updateFn]
  );

  return {
    /**
     * Увеличивает счётчик.
     *
     * @param {number|string} itemId - Идентификатор элемента
     * @param {number} [delta=1] - Изменение счётчика
     * @returns {void}
     */
    increment: (itemId, delta = 1) => updateCounter(itemId, delta),
    /**
     * Уменьшает счётчик.
     *
     * @param {number|string} itemId - Идентификатор элемента
     * @param {number} [delta=1] - Изменение счётчика
     * @returns {void}
     */
    decrement: (itemId, delta = 1) => updateCounter(itemId, -delta),
    incrementWithApi,
  };
};
