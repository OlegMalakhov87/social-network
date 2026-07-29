import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../..';
import {
  useEscapeKey,
  useLockBodyScroll,
  useOutsideClick,
} from '../../../hooks';
import { classNames } from '../../../lib';
import styles from './Modal.module.css';

/**
 * Универсальное модальное окно.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - открыт ли модальное окно
 * @param {Function} props.onClose - функция закрытия модального окна
 * @param {React.ReactNode} props.children - контент модального окна
 * @param {string} [props.title] - заголовок модального окна
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - размер модального окна
 * @param {boolean} [props.closeOnOverlay=true] - закрывать ли модальное окно при клике вне окна
 * @param {boolean} [props.closeOnEscape=true] - закрывать ли модальное окно при нажатии Escape
 * @param {React.ReactNode} [props.footer] - нижний колонтитул модального окна
 */
export const Modal = ({
  isOpen = true,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlay = true,
  footer,
}) => {
  const modalRef = useRef(null);

  // Закрытие при клике вне компонента
  useOutsideClick(modalRef, onClose);

  // Закрытие по Escape
  useEscapeKey(onClose);

  // Блокировка скролла
  useLockBodyScroll();

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={classNames(styles.modal, styles[size])}
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
              aria-label="Закрыть окно"
            >
              ✕
            </Button>
          </header>
        )}

        <div className={styles.content}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>,
    document.body
  );
};
