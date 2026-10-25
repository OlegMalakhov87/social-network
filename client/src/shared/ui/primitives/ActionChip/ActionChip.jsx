import { classNames, handleKeyboardClick } from '../../../utils';

import style from './ActionChip.module.css';

/**
 * Отображает компактную кнопку действия.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.icon - Иконка кнопки
 * @param {string|number} [props.label] - Текст кнопки
 * @param {string} [props.ariaLabel] - Значение атрибута aria-label
 * @param {Function} props.onClick - Обработчик нажатия
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {'default'|'primary'|'danger'} [props.variant='default'] - Вариант оформления
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Кнопка действия.
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
