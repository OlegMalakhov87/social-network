import { useMemo } from 'react';

import { createNotifier } from '../lib';
import { useToast } from '../ui';

/**
 * Возвращает методы показа уведомлений.
 *
 * @returns {{
 *   success: Function,
 *   error: Function,
 *   warning: Function,
 *   info: Function,
 *   createHandlers: Function
 * }} Методы уведомлений и пара обработчиков.
 */
export const useNotify = () => {
  const toast = useToast();

  return useMemo(() => createNotifier(toast), [toast]);
};
