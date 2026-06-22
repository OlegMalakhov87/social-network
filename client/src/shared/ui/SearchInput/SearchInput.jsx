import style from './SearchInput.module.css';

/**
 * Универсальный инпут поиска.
 * @param {Object} props
 * @param {string} props.value - текущее значение
 * @param {Function} props.onChange - колбэк изменения (e)
 * @param {string} [props.placeholder='Поиск...'] - placeholder
 * @param {string} [props.className] - дополнительный класс
 * @param {Function} [props.onKeyDown] - обработчик нажатия клавиш (например, Enter)
 */
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Поиск...',
  className = '',
  onKeyDown,
}) => {
  return (
    <input
      type="text"
      className={`${style.input} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
};
