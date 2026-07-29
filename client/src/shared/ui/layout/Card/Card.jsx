import { forwardRef } from 'react';
import { classNames } from '../../lib';
import styles from './Card.module.css';

/**
* Базовый контейнер карточки.

* Отвечает только за внешний вид: фон, границы, скругления, тени, hover и внутренние отступы.
 *
 * Вся структура карточки (Header, Content, Actions и т.д.)
 * строится внутри BaseCard.
 *
 * @param {Object} props 
 * @param {React.ReactNode} props.children - Содержимое карточки.
 * @param {boolean} [props.hover=false] - Добавляет эффект при наведении.
 * @param {boolean} [props.padding=true] - Внутренние отступы.
 * @param {string} [props.className=''] - Дополнительный CSS класс.
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
