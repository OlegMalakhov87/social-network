import { classNames, handleKeyboardClick } from '../../lib';
import style from './IconButton.module.css';

/**
 * Универсальная кнопка с иконкой.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - иконка (эмодзи или SVG)
 * @param {'ghost' | 'overlay' | 'primary' | 'danger' | 'warning' | 'success'} [props.variant='ghost'] - вариант оформления
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - размер
 * @param {Function} props.onClick - обработчик клика
 * @param {boolean} [props.disabled=false] - заблокирована
 * @param {string} [props.ariaLabel] - доступное название
 * @param {string} [props.className] - дополнительный CSS-класс
 */
export const IconButton = ({
  icon,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  ariaLabel,
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        style.button,
        style[variant],
        style[size],
        disabled && style.disabled,
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => handleKeyboardClick(e, onClick)}
      tabIndex={0}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};
