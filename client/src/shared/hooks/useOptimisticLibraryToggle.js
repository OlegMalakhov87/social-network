import { useCallback } from 'react';

import { getApiErrorDisplay, parseApiError } from '../lib';
import { useNotify } from './';

/**
 * Добавляет элемент в библиотеку и удаляет его до ответа сервера.
 *
 * @param {Object} params - Параметры библиотеки
 * @param {Function} params.setItems - Обновляет массив элементов
 * @param {Function} params.addFn - Добавляет элемент на сервере
 * @param {Function} params.deleteFn - Удаляет элемент на сервере
 * @param {Function} [params.mapOnAdd] - Возвращает дополнительные поля при добавлении
 * @param {Function} [params.mapOnRemove] - Возвращает дополнительные поля при удалении
 * @returns {{ addToLibrary: Function, deleteFromLibrary: Function }} Методы изменения библиотеки.
 */
export const useOptimisticLibraryToggle = ({
  setItems,
  addFn,
  deleteFn,
  mapOnAdd,
  mapOnRemove,
}) => {
  const notify = useNotify();

  /**
   * Добавляет элемент в библиотеку и возвращает прежнее состояние при ошибке.
   *
   * @param {number|string} itemId - Идентификатор элемента
   * @returns {Promise<boolean|undefined>} Результат добавления: false при пустом идентификаторе или ошибке сервера и undefined после успеха.
   */
  const addToLibrary = useCallback(
    async (itemId) => {
      if (!itemId) return false;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(mapOnAdd?.() ?? {}),
              }
            : item
        )
      );

      try {
        const result = await addFn(itemId);
        const libraryId = result?.libraryItem?.id ?? null;

        if (libraryId) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    libraryId,
                    isInLibrary: true,
                  }
                : item
            )
          );
        }
      } catch (err) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  libraryId: null,
                  isInLibrary: false,
                }
              : item
          )
        );
        const parsedError = parseApiError(
          err,
          'Ошибка добавления в библиотеку'
        );
        notify.error(
          getApiErrorDisplay(parsedError, 'Ошибка добавления в библиотеку')
        );
        return false;
      }
    },
    [setItems, addFn, mapOnAdd, notify]
  );

  /**
   * Удаляет элемент из библиотеки и возвращает прежнее состояние при ошибке.
   *
   * @param {number|string} libraryId - Идентификатор элемента библиотеки
   * @param {number|string} itemId - Идентификатор элемента
   * @returns {Promise<boolean|undefined>} Результат удаления: false при пустых идентификаторах или ошибке сервера и undefined после успеха.
   */
  const deleteFromLibrary = useCallback(
    async (libraryId, itemId) => {
      if (!libraryId || !itemId) return false;

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                ...(mapOnRemove?.() ?? {}),
              }
            : item
        )
      );

      try {
        const result = await deleteFn(libraryId);
        const deletedLibraryId = result?.libraryId ?? null;

        if (deletedLibraryId) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    libraryId: null,
                    isInLibrary: false,
                  }
                : item
            )
          );
        }
      } catch (err) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isInLibrary: true,
                  libraryId,
                }
              : item
          )
        );
        const parsedError = parseApiError(err, 'Ошибка удаления из библиотеки');
        notify.error(
          getApiErrorDisplay(parsedError, 'Ошибка удаления из библиотеки')
        );
        return false;
      }
    },
    [setItems, deleteFn, mapOnRemove, notify]
  );

  return { addToLibrary, deleteFromLibrary };
};
