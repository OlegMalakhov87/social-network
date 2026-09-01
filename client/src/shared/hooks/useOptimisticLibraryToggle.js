import { useCallback } from 'react';
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
      if (!itemId) return;

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
        notify.error('Ошибка добавления в библиотеку');
        console.error('Ошибка добавления в библиотеку', err);
      }
    },
    [setItems, addFn, mapOnAdd, notify]
  );

  /** Функция для удаления элемента из библиотеки */
  const deleteFromLibrary = useCallback(
    async (libraryId, itemId) => {
      if (!libraryId || !itemId) return;

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
        notify.error('Ошибка удаления из библиотеки');
        console.error('Ошибка удаления из библиотеки', err);
      }
    },
    [setItems, deleteFn, mapOnRemove, notify]
  );

  return { addToLibrary, deleteFromLibrary };
};
