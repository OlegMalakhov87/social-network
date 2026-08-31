import { useMemo } from 'react';
import { createNotifier } from '../lib';
import { useToast } from '../ui';

/**
 * Хук для работы с уведомлениями в компонентах.
 *
 * @returns {Object} - объект с методами
 */
export const useNotify = () => {
  const toast = useToast();

  return useMemo(() => createNotifier(toast), [toast]);
};
