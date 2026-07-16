import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичных мутаций (CRUD).
 *
 * @template T
 * @param {T[]} items - массив сущностей
 * @param {Function} setItems - функция обновления массива
 * @param {Object} config - конфигурация
 * @param {Function} config.addFn - функция добавления (async)
 * @param {Function} config.editFn - функция обновления (async)
 * @param {Function} config.deleteFn - функция удаления (async)
 * @param {string} config.idField - поле ID (по умолчанию 'id')
 * @param {Function} config.onSuccess - колбэк успеха
 * @param {Function} config.onError - колбэк ошибки
 * @returns {Object} - { add, edit, remove }
 */
export function useOptimisticMutation({
  items,
  setItems,
  addFn,
  editFn,
  deleteFn,
  idField = 'id',
  onSuccess,
  onError,
}) {
  /**
   * Добавление сущности
   */
  const addItem = useCallback(
    async (data) => {
      if (!addFn) {
        return false;
      }

      try {
        const result = await addFn(data);

        // Оптимистичное добавление
        setItems((prev) => [result, ...prev]);

        onSuccess?.('add', result);
        return true;
      } catch (err) {
        console.error('Ошибка добавления:', err);
        onError?.('add', err);
        return false;
      }
    },
    [addFn, setItems, onSuccess, onError]
  );

  /**
   * Обновление сущности
   */
  const editItem = useCallback(
    async (id, data) => {
      if (!editFn || !id) return false;

      // Сохраняем старые данные для отката
      const oldItems = items;

      // Оптимистичное обновление
      setItems((prev) =>
        prev.map((item) => (item[idField] === id ? { ...item, ...data } : item))
      );

      try {
        const result = await editFn(id, data);
        onSuccess?.('edit', result);
        return true;
      } catch (err) {
        // Откат
        setItems(oldItems);
        console.error('Ошибка обновления:', err);
        onError?.('edit', err);
        return false;
      }
    },
    [items, setItems, editFn, idField, onSuccess, onError]
  );

  /**
   * Удаление сущности
   */
  const removeItem = useCallback(
    async (id) => {
      if (!deleteFn || !id) return false;

      // Сохраняем старые данные для отката
      const oldItems = items;

      // Оптимистичное удаление
      setItems((prev) => prev.filter((item) => item[idField] !== id));

      try {
        const result = await deleteFn(id);
        onSuccess?.('delete', result);
        return true;
      } catch (err) {
        // Откат
        setItems(oldItems);
        console.error('Ошибка удаления:', err);
        onError?.('delete', err);
        return false;
      }
    },
    [items, setItems, deleteFn, idField, onSuccess, onError]
  );

  return { addItem, editItem, removeItem };
}
