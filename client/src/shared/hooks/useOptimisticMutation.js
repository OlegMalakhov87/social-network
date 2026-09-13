import { useCallback } from 'react';
import { parseApiError } from '../lib';

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
      const optimisticId = `temp-${Date.now()}`;

      const optimisticItem = {
        ...data,
        [idField]: optimisticId,
      };

      setItems((prev) => [optimisticItem, ...prev]);

      try {
        const result = await addFn(data);

        setItems((prev) =>
          prev.map((item) => (item[idField] === optimisticId ? result : item))
        );

        return true;
      } catch (err) {
        setItems((prev) =>
          prev.filter((item) => item[idField] !== optimisticId)
        );
        throw parseApiError(err, 'Ошибка добавления');
      }
    },
    [addFn, setItems, idField]
  );

  /** Обновление сущности */
  const editItem = useCallback(
    async (id, data) => {
      if (!editFn || id == null) return false;

      const oldItems = items;

      setItems((prev) =>
        prev.map((item) => (item[idField] === id ? { ...item, ...data } : item))
      );

      try {
        const result = await editFn(id, data);

        if (result && result[idField] != null) {
          setItems((prev) =>
            prev.map((item) =>
              item[idField] === id ? { ...item, ...result } : item
            )
          );
        }

        return true;
      } catch (err) {
        setItems(oldItems);
        throw parseApiError(err, 'Ошибка обновления');
      }
    },
    [items, setItems, editFn, idField]
  );

  /** Удаление сущности */
  const removeItem = useCallback(
    async (id) => {
      if (!deleteFn || id == null) return false;

      const oldItems = items;

      setItems((prev) => prev.filter((item) => item[idField] !== id));

      try {
        await deleteFn(id);
        return true;
      } catch (err) {
        setItems(oldItems);
        throw parseApiError(err, 'Ошибка удаления');
      }
    },
    [items, setItems, deleteFn, idField]
  );

  return {
    add: addItem,
    edit: editItem,
    remove: removeItem,
  };
};
