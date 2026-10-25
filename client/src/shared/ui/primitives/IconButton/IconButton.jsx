import { classNames, handleKeyboardClick } from '../../../utils';

import style from './IconButton.module.css';

/**
 * Отображает кнопку с иконкой.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.type='button'] - Тип кнопки
 * @param {React.ReactNode} props.icon - Иконка кнопки
 * @param {'ghost'|'overlay'|'primary'|'danger'|'warning'|'success'} [props.variant='ghost'] - Вариант оформления
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Размер кнопки
 * @param {Function} props.onClick - Обработчик нажатия
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {string} [props.ariaLabel] - Значение атрибута aria-label
 * @param {string} [props.className] - Дополнительный CSS-класс
 * @returns {JSX.Element} Кнопка с иконкой.
 */
export const IconButton = ({
  type = 'button',
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
      type={type}
      className={classNames(
        style.button,
        style[variant],
        style[size],
        disabled && style.disabled,
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
      onKeyDown={(e) => handleKeyboardClick(e, onClick)}
      tabIndex={0}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};
