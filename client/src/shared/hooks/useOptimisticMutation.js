import { useCallback } from 'react';

import { parseApiError } from '../lib';

/**
 * Добавляет, изменяет и удаляет элемент до ответа сервера.
 *
 * @param {Object} params - Параметры изменения
 * @param {Array} params.items - Текущие элементы
 * @param {Function} params.setItems - Обновляет массив элементов
 * @param {Function} params.addFn - Добавляет элемент на сервере
 * @param {Function} params.editFn - Обновляет элемент на сервере
 * @param {Function} params.deleteFn - Удаляет элемент на сервере
 * @param {string} [params.idField='id'] - Поле идентификатора
 * @param {Function} [params.onSuccess] - Вызывается после успешной операции
 * @param {Function} [params.onError] - Вызывается при ошибке
 * @returns {{ add: Function, edit: Function, remove: Function }} Методы добавления, изменения и удаления.
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
  /**
   * Добавляет элемент и убирает его при ошибке сервера.
   *
   * @param {Object} data - Данные нового элемента
   * @returns {Promise<boolean>} Признак успеха или false, если добавление недоступно.
   */
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

  /**
   * Изменяет элемент и возвращает прежнее состояние при ошибке.
   *
   * @param {number|string} id - Идентификатор элемента
   * @param {Object} data - Новые поля элемента
   * @returns {Promise<boolean>} Признак успеха или false, если изменение недоступно или идентификатор пуст.
   */
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

  /**
   * Удаляет элемент и возвращает прежнее состояние при ошибке.
   *
   * @param {number|string} id - Идентификатор элемента
   * @returns {Promise<boolean>} Признак успеха или false, если удаление недоступно или идентификатор пуст.
   */
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
