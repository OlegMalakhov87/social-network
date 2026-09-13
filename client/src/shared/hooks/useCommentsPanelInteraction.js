import { useCallback, useEffect } from 'react';
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

  useOutsideClick(panelRef, handleClose, isOpen);

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
