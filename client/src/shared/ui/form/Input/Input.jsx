import { forwardRef, useState } from 'react';

import { Text } from '../../../ui';
import { classNames, formatPhone } from '../../../utils';

import styles from './Input.module.css';

/**
 * Отображает поле ввода и форматирует телефон, если тип равен tel.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.label] - Подпись поля
 * @param {string} [props.error] - Текст ошибки
 * @param {string} [props.helperText] - Текст подсказки
 * @param {React.ReactNode} [props.leftIcon] - Иконка слева
 * @param {React.ReactNode} [props.rightIcon] - Иконка справа
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @param {boolean} [props.fullWidth=false] - Растягивание на всю ширину
 * @param {boolean} [props.multiline=false] - Многострочный ввод
 * @param {number} [props.rows=3] - Количество строк
 * @param {string} [props.type='text'] - Тип поля
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {boolean} [props.required=false] - Признак обязательного поля
 * @param {Function} [props.onChange] - Обработчик изменения значения
 * @param {React.Ref} ref - Ссылка на элемент
 * @returns {JSX.Element} Поле ввода.
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
      rows = 3,
      type = 'text',
      disabled = false,
      required = false,
      onChange,
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
          <Text variant="body2">
            {label}
            {required && <span className={styles.required}>*</span>}
          </Text>
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
              onChange={(e) => {
                onChange?.(e);
              }}
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
              onChange={(e) => {
                if (type === 'tel') {
                  const formatted = formatPhone(e.target.value);
                  onChange?.({
                    target: { name: e.target.name, value: formatted },
                  });
                } else {
                  onChange?.(e);
                }
              }}
              {...props}
            />
          )}

          {isPassword && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
            </button>
          )}

          {!isPassword && rightIcon && (
            <span className={styles.icon}>{rightIcon}</span>
          )}
        </div>

        {error ? (
          <Text variant="caption" className={styles.errorText}>
            {error}
          </Text>
        ) : (
          helperText && (
            <Text variant="caption" className={styles.helper}>
              {helperText}
            </Text>
          )
        )}
      </div>
    );
  }
);
