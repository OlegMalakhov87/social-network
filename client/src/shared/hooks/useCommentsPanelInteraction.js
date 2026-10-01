import { useCallback, useEffect, useMemo } from 'react';
import { useEscapeKey, useOutsideClick } from './';

/**
 * Хук для взаимодействия с панелью комментариев.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - флаг открытия панели комментариев.
 * @param {Function} props.onClose - функция для закрытия панели комментариев.
 * @param {RefObject} props.panelRef - ref на панель комментариев.
 * @param {Function} props.getReturnElement - функция для получения элемента, на который нужно вернуться после закрытия панели комментариев.
 * @returns {Object} объект с функцией для закрытия панели комментариев.
 */
export const useCommentsPanelInteraction = ({
  isOpen,
  onClose,
  panelRef,
  getReturnElement,
}) => {
  const modalOverlaySelector = useMemo(() => ['[data-modal-overlay]'], []);

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
    // Когда открыт ConfirmDialog внутри панели, клики по modal overlay
    // не должны схлопывать всю панель комментариев.
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
