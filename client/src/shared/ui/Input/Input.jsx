import PropTypes from 'prop-types';
import { forwardRef, useState } from 'react';
import styles from './Input.module.css';
import { classNames } from '../../lib';

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
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.fullWidth=true]
 * @param {boolean} [props.multiline=false]
 * @param {number} [props.rows=4]
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
      <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div
          className={ classNames(styles.inputWrapper, error && styles.error, disabled && styles.disabled)}
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

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};
