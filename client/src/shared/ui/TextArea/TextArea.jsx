  import { forwardRef } from 'react';
  import { classNames } from '../../lib';
  import styles from './TextArea.module.css';

  /**
   * Универсальное текстовое поле.
   *
   * @param {Object} props
   * @param {string} [props.className=''] - дополнительный CSS класс
   * @param {string} props.error - сообщение об ошибке
   * @param {boolean} props.disabled - заблокирован ли текстовое поле
   * @param {number} props.rows - количество строк
   * @param {React.Ref<HTMLTextAreaElement>} props.ref - ссылка на текстовое поле
   */

  export const TextArea = forwardRef(
    ({ className = '', error, disabled, rows = 4, ...props }, ref) => {
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

  TextArea.displayName = 'TextArea';
