import { classNames, handleKeyboardClick } from '../../lib';
import style from './ActionChip.module.css';

/**
 * Универсальная кнопка действия.
 *
 * Используется внутри ActionBar, EntityActions и карточек.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string|number} [props.label]
 * @param {string} [props.ariaLabel]
 * @param {Function} props.onClick
 * @param {boolean} [props.disabled]
 * @param {'default'|'primary'|'danger'} [props.variant]
 * @param {string} [props.className]
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
