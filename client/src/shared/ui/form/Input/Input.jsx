import { forwardRef, useState } from 'react';
import { classNames } from '../../../lib';
import styles from './Input.module.css';

/**
 * Универсальный компонент поля ввода.
 *
 * Поддерживает:
 * - label
 * - helperText
 * - error
 * - left/right иконки
 * - password show/hide
 * - textarea
 * - fullWidth
 *
 * @param {Object} props
 * @param {string} [props.label] - текст лейбла
 * @param {string} [props.error] - текст ошибки
 * @param {string} [props.helperText] - текст подсказки
 * @param {React.ReactNode} [props.leftIcon] - иконка слева
 * @param {React.ReactNode} [props.rightIcon] - иконка справа
 * @param {boolean} [props.fullWidth=true] - полная ширина
 * @param {boolean} [props.multiline=false] - textarea
 * @param {number} [props.rows=4] - количество строк
 */
export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      fullWidth = false,
      multiline = false,
      rows,
      type,
      disabled,
      required = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';

    const inputType = isPassword && showPassword ? 'text' : type;

    return (
      <div
        className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}
      >
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div
          className={classNames(
            styles.inputWrapper,
            error && styles.error,
            disabled && styles.disabled
          )}
        >
          {leftIcon && <span className={styles.icon}>{leftIcon}</span>}

          {multiline ? (
            <textarea
              ref={ref}
              rows={rows}
              className={classNames(styles.input, className)}
              disabled={disabled}
              {...props}
            />
          ) : (
            <input
              ref={ref}
              type={inputType}
              className={classNames(styles.input, className)}
              disabled={disabled}
              required={required}
              {...props}
            />
          )}

          {isPassword && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          )}

          {!isPassword && rightIcon && (
            <span className={styles.icon}>{rightIcon}</span>
          )}
        </div>

        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : (
          helperText && <span className={styles.helper}>{helperText}</span>
        )}
      </div>
    );
  }
);
