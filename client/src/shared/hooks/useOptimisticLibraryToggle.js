import { useCallback } from 'react';
import { getApiErrorDisplay, parseApiError } from '../lib';
import { useNotify } from './';

/**
 * Оптимистичное добавление/удаление из библиотеки.
 *
 * @param {Object} params
 * @param {Function} params.setItems - функция для установки массива элементов
 * @param {Function} params.addFn - функция для добавления элемента в библиотеку
 * @param {Function} params.deleteFn - функция для удаления элемента из библиотеки
 * @param {Function} params.mapOnAdd - функция для получения дополнительных полей при добавлении
 * @param {Function} params.mapOnRemove - функция для получения дополнительных полей при удалении
 * @returns {Object} - объект с функциями для добавления и удаления из библиотеки
 */
export const useOptimisticLibraryToggle = ({
  setItems,
  addFn,
  deleteFn,
  mapOnAdd,
  mapOnRemove,
}) => {
  const notify = useNotify();

  /** Функция для добавления элемента в библиотеку */
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

  /** Функция для удаления элемента из библиотеки */
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
