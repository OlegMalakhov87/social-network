import { classNames } from '../../../utils';
import styles from './Button.module.css';

/**
 * Универсальная кнопка приложения.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Содержимое кнопки.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Тип кнопки.
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'|'success'} [props.variant='primary'] - Вариант оформления.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Размер кнопки.
 * @param {boolean} [props.fullWidth=false] - Растянуть кнопку на всю ширину.
 * @param {boolean} [props.loading=false] - Показывать состояние загрузки.
 * @param {boolean} [props.disabled=false] - Заблокировать кнопку.
 * @param {React.ReactNode} [props.leftIcon] - Иконка слева.
 * @param {React.ReactNode} [props.rightIcon] - Иконка справа.
 * @param {Function} [props.onClick] - Обработчик нажатия.
 * @param {string} [props.className=''] - Дополнительный CSS класс.
 */

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  ...rest
}) => {
  const buttonClassName = classNames(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  );

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className={styles.spinner} />}

      {!loading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span className={styles.icon}>{rightIcon}</span>
      )}
    </button>
  );
};
