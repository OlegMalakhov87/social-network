import { useCallback } from 'react';

/**
 * Универсальный хук для оптимистичных мутаций (CRUD).
 *
 * @param {Object} params - параметры запроса
 * @param {Array} params.items - массив сущностей
 * @param {Function} params.setItems - функция обновления массива
 * @param {Function} params.addFn - функция добавления (async)
 * @param {Function} params.editFn - функция обновления (async)
 * @param {Function} params.deleteFn - функция удаления (async)
 * @param {string} [params.idField='id'] - поле ID
 * @param {Function} [params.onSuccess] - колбэк успеха
 * @param {Function} [params.onError] - колбэк ошибки
 * @returns {Object} - { add, edit, remove }
 */
export const useOptimisticMutation = ({
  items,
  setItems,
  addFn,
  editFn,
  deleteFn,
  idField = 'id',
  onSuccess,
  onError,
}) => {
  /** Добавление сущности */
  const addItem = useCallback(
    async (data) => {
      if (!addFn) {
        return false;
      }

      try {
        const result = await addFn(data);

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

  /** Обновление сущности */
  const editItem = useCallback(
    async (id, data) => {
      if (!editFn || !id) return false;

      const oldItems = items;

      setItems((prev) =>
        prev.map((item) => (item[idField] === id ? { ...item, ...data } : item))
      );

      try {
        const result = await editFn(id, data);
        onSuccess?.('edit', result);
        return true;
      } catch (err) {
        setItems(oldItems);
        console.error('Ошибка обновления:', err);
        onError?.('edit', err);
        return false;
      }
    },
    [items, setItems, editFn, idField, onSuccess, onError]
  );

  /** Удаление сущности */
  const removeItem = useCallback(
    async (id) => {
      if (!deleteFn || !id) return false;

      const oldItems = items;

      setItems((prev) => prev.filter((item) => item[idField] !== id));

      try {
        const result = await deleteFn(id);
        onSuccess?.('delete', result);
        return true;
      } catch (err) {
        setItems(oldItems);
        console.error('Ошибка удаления:', err);
        onError?.('delete', err);
        return false;
      }
    },
    [items, setItems, deleteFn, idField, onSuccess, onError]
  );

  return { addItem, editItem, removeItem };
};
