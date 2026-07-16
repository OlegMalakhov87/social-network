import { useMemo } from 'react';
import { createNotifier } from '../lib';
import { useToast } from '../ui';

/**
 * Хук для работы с уведомлениями в компонентах.
 * @param {string} [entity] - тип сущности
 * @returns {object} - объект с методами
 */
export const useNotify = (entity = null) => {
  const toast = useToast();

  return useMemo(() => createNotifier(toast, entity), [toast, entity]);
};
