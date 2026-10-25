import { forwardRef } from 'react';

import { classNames } from '../../../utils';

import styles from './Card.module.css';

/**
 * Отображает карточку с фоном, границей, тенью и отступами.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое карточки
 * @param {boolean} [props.hover=false] - Эффект при наведении
 * @param {boolean} [props.padding=true] - Внутренние отступы
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {React.Ref<HTMLElement>} ref - Ссылка на элемент
 * @returns {JSX.Element} Карточка.
 */

export const Card = forwardRef(
  ({ children, hover = false, padding = true, className = '' }, ref) => {
    return (
      <section
        ref={ref}
        className={classNames(
          styles.card,
          hover && styles.hover,
          padding && styles.padding,
          className
        )}
      >
        {children}
      </section>
    );
  }
);
