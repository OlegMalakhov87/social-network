import { useRef, useState } from 'react';

import { useEscapeKey, useOutsideClick } from '../../../hooks';

import styles from './Dropdown.module.css';

/**
 * Отображает список сортировки.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} props.options - Варианты сортировки: ключ и поля идентификатора и подписи
 * @param {string} props.currentSort - Ключ выбранного варианта
 * @param {Function} props.onChange - Обработчик выбора, получает идентификатор варианта
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @returns {JSX.Element|null} Список сортировки или пустой результат без вариантов.
 */
export const Dropdown = ({
  options,
  currentSort,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  useEscapeKey(() => setIsOpen(false));

  const items = Object.values(options);
  const currentOption = options?.[currentSort] || items[0];

  /**
   * Сохраняет выбранный вариант и закрывает список.
   *
   * @param {string} optionId - Идентификатор варианта
   * @returns {void}
   */
  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  if (!options || items.length === 0) return null;

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={styles.triggerButton}
        onClick={(e) => {
          e?.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Выбрать сортировку"
        disabled={disabled}
      >
        <span className={styles.label}>{currentOption?.label}</span>
        <span
          className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {items.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={currentSort === option.id}
              className={`${styles.menuItem} ${
                currentSort === option.id ? styles.menuItemActive : ''
              }`}
              onClick={() => handleSelect(option.id)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
