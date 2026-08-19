import { useCallback, useEffect, useRef } from 'react';

/**
 * Универсальный хук для оптимистичного обновления счётчиков.
 *
 * @param {Object} params - параметры запроса
 * @param {Array} params.items - массив сущностей
 * @param {Function} params.setItems - функция обновления массива
 * @param {string} params.countField - поле счётчика
 * @param {Function} params.updateFn - асинхронная функция обновления счётчика
 * @returns {Object} - { increment, decrement, incrementWithApi }
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

  // Оптимистичное обновление с откатом при ошибке
  const incrementWithApi = useCallback(
    async (itemId, libraryId = null, delta = 1) => {
      if (!itemId) return;

      // Сохраняем старое значение для отката
      const oldItems = itemsRef.current;

      // Оптимистичное обновление
      updateCounter(itemId, delta);

      try {
        if (updateFn) {
          const result = await updateFn(libraryId ?? itemId);

          // Если сервер вернул lastWatchedAt — обновляем его в состоянии
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
        // Откат
        setItems(oldItems);
        console.error('Ошибка обновления счётчика:', err);
        return false;
      }
    },
    [setItems, updateCounter, updateFn]
  );

  return {
    increment: (itemId, delta = 1) => updateCounter(itemId, delta),
    decrement: (itemId, delta = 1) => updateCounter(itemId, -delta),
    incrementWithApi,
  };
};
