import { useRef } from 'react';
import { createPortal } from 'react-dom';

import {
  useEscapeKey,
  useLockBodyScroll,
  useOutsideClick,
} from '../../../hooks';
import { Button } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './Modal.module.css';

/**
 * Отображает модальное окно.
 *
 * @param {Object} props - Свойства компонента
 * @param {boolean} [props.isOpen=true] - Признак открытого окна
 * @param {Function} props.onClose - Обработчик закрытия
 * @param {React.ReactNode} props.children - Содержимое окна
 * @param {string} [props.title] - Заголовок окна
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Размер окна
 * @param {boolean} [props.closeOnOverlay=true] - Закрытие по щелчку на наложение
 * @param {boolean} [props.closeOnEscape=true] - Закрытие по клавише Escape
 * @param {React.ReactNode} [props.footer] - Нижняя часть окна
 * @param {boolean} [props.mobileFullscreen=true] - Полноэкранный режим на узком экране
 * @param {string} [props.className=''] - Дополнительный CSS-класс окна
 * @param {string} [props.contentClassName=''] - Дополнительный CSS-класс содержимого
 * @returns {JSX.Element|null} Модальное окно или пустой результат, если оно закрыто.
 */
export const Modal = ({
  isOpen = true,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  mobileFullscreen = true,
  className = '',
  contentClassName = '',
}) => {
  const modalRef = useRef(null);

  useOutsideClick(modalRef, onClose, isOpen);
  useEscapeKey(onClose, isOpen && closeOnEscape);
  useLockBodyScroll(isOpen);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={classNames(
        styles.overlay,
        !mobileFullscreen && styles.overlayCenteredMobile
      )}
      data-modal-overlay
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={classNames(
          styles.modal,
          styles[size],
          !mobileFullscreen && styles.modalCenteredMobile,
          className
        )}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <header className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              ariaLabel="Закрыть окно"
            >
              ✕
            </Button>
          </header>
        )}

        <div className={classNames(styles.content, contentClassName)}>
          {children}
        </div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
};
