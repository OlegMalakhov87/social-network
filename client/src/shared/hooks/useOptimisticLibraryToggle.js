import { useCallback } from 'react';
import { useNotify } from './';

/**
 * Простой хук для оптимистичного добавления/удаления из библиотеки на общих страницах каталога (Music, Video).
 *
 * @param {Object} params - параметры запроса
 * @param {Function} params.setItems - функция для установки элементов
 * @param {Function} params.addFn - функция для добавления в библиотеку
 * @param {Function} params.removeFn - функция для удаления из библиотеки
 * @param {string} params.entityType - тип сущности
 * @returns {Object} - { addToLibrary, removeFromLibrary }
 */

export const useOptimisticLibraryToggle = ({
  setItems,
  addFn,
  removeFn,
  entityType,
}) => {
  const notify = useNotify(entityType);

  const addToLibrary = useCallback(
    async (itemId) => {
      setItems((prev) =>
        prev.map((t) => (t.id === itemId ? { ...t, isInLibrary: true } : t))
      );
      try {
        const result = await addFn(itemId);
        setItems((prev) =>
          prev.map((t) =>
            t.id === itemId ? { ...t, libraryId: result.libraryItem?.id } : t
          )
        );
        notify.success('add');
      } catch (err) {
        setItems((prev) =>
          prev.map((t) => (t.id === itemId ? { ...t, isInLibrary: false } : t))
        );
        notify.error('add');
        console.error('Ошибка добавления в библиотеку', err);
      }
    },
    [setItems, addFn, notify]
  );

  const removeFromLibrary = useCallback(
    async (libraryId, itemId) => {
      if (!libraryId) return;
      setItems((prev) =>
        prev.map((t) =>
          t.id === itemId ? { ...t, isInLibrary: false, libraryId: null } : t
        )
      );
      try {
        await removeFn(libraryId);
        notify.success('delete');
      } catch (err) {
        setItems((prev) =>
          prev.map((t) =>
            t.id === itemId ? { ...t, isInLibrary: true, libraryId } : t
          )
        );
        notify.error('delete');
        console.error('Ошибка удаления из библиотеки', err);
      }
    },
    [setItems, removeFn, notify]
  );

  return { addToLibrary, removeFromLibrary };
};
