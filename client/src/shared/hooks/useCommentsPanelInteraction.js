import { useCallback, useEffect, useMemo } from 'react';

import { useEscapeKey, useOutsideClick } from './';

/**
 * Закрывает панель комментариев и возвращает прокрутку к исходному элементу.
 *
 * @param {Object} props - Параметры панели
 * @param {boolean} props.isOpen - Панель открыта
 * @param {Function} props.onClose - Закрывает панель
 * @param {import('react').RefObject} props.panelRef - Ссылка на панель
 * @param {Function} props.getReturnElement - Возвращает элемент для возврата прокрутки
 * @returns {{ handleClose: Function }} Обработчик закрытия панели.
 */
export const useCommentsPanelInteraction = ({
  isOpen,
  onClose,
  panelRef,
  getReturnElement,
}) => {
  const modalOverlaySelector = useMemo(() => ['[data-modal-overlay]'], []);

  /**
   * Закрывает панель и прокручивает страницу к исходному элементу.
   *
   * @returns {void}
   */
  const handleClose = useCallback(() => {
    onClose?.();

    requestAnimationFrame(() => {
      getReturnElement?.()?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [onClose, getReturnElement]);

  useEscapeKey(handleClose, isOpen, true);

  useOutsideClick(panelRef, handleClose, isOpen, {
    // Игнорирует щелчки по наложению, пока внутри панели открыто окно подтверждения.
    ignoreSelectors: modalOverlaySelector,
  });

  useEffect(() => {
    if (!isOpen) return;

    const frame = requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, panelRef]);

  return {
    handleClose,
  };
};
