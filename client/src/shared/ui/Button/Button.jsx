import PropTypes from 'prop-types';
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
}) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={(e) => {
        e?.stopPropagation();
        onClick();
      }}
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

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'outline',
    'ghost',
    'danger',
    'success',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
