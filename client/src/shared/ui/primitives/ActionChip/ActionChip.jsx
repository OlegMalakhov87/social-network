import { classNames, handleKeyboardClick } from '../../../utils';
import style from './ActionChip.module.css';

/**
 * Универсальная кнопка действия.
 *
 * Используется внутри ActionBar, EntityActions и карточек.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - иконка кнопки
 * @param {string|number} [props.label] - текст кнопки
 * @param {string} [props.ariaLabel] - aria-label для кнопки
 * @param {Function} props.onClick - обработчик клика
 * @param {boolean} [props.disabled] - заблокирован ли кнопка
 * @param {'default'|'primary'|'danger'} [props.variant] - вариант кнопки
 * @param {string} [props.className] - дополнительный класс
 */

export const ActionChip = ({
  icon,
  label,
  ariaLabel,
  onClick,
  disabled = false,
  variant = 'default',
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        style.chip,
        style[variant],
        disabled && style.disabled,
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onKeyDown={(e) => handleKeyboardClick(e, onClick)}
    >
      {icon && <span className={style.icon}>{icon}</span>}

      {label !== undefined && <span className={style.label}>{label}</span>}
    </button>
  );
};
