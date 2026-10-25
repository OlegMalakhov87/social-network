import { forwardRef } from 'react';

import { classNames } from '../../../utils';

import styles from './TextArea.module.css';

/**
 * Отображает многострочное поле ввода.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {string} [props.error] - Текст ошибки
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {number} [props.rows=3] - Количество строк
 * @param {React.Ref<HTMLTextAreaElement>} ref - Ссылка на поле
 * @returns {JSX.Element} Многострочное поле.
 */

export const TextArea = forwardRef(
  ({ className = '', error, disabled = false, rows = 3, ...props }, ref) => {
    return (
      <>
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={classNames(
            styles.textarea,
            error && styles.error,
            className
          )}
          {...props}
        />

        {error && <span className={styles.errorMessage}>{error}</span>}
      </>
    );
  }
);
