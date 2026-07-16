  import { forwardRef } from 'react';
  import { classNames } from '../../lib';
  import styles from './TextArea.module.css';

  /**
   * Универсальное текстовое поле.
   *
   * @param {Object} props
   * @param {string} props.className
   * @param {string} props.error
   * @param {boolean} props.disabled
   * @param {number} props.rows
   * @param {React.Ref<HTMLTextAreaElement>} props.ref
   */

  export const TextArea = forwardRef(
    ({ className, error, disabled, rows = 4, ...props }, ref) => {
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
