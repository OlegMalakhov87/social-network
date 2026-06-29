import { useState, useRef } from 'react';
import style from './Dropdown.module.css';
import { useEscapeKey, useOutsideClick, useLockBodyScroll } from '../../hooks';

/**
 * Выпадающий список сортировки.
 * @param {Object} props
 * @param {Object} props.options - объект с вариантами сортировки (ключи — id, значения — { id, label })
 * @param {string} props.currentSort - текущий выбранный ключ сортировки
 * @param {Function} props.onChange - колбэк при выборе варианта (получает id)
 */
export const Dropdown = ({ options, currentSort, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрытие при клике вне компонента
  useOutsideClick(dropdownRef, setIsOpen(false));

  // Закрытие по Escape
  useEscapeKey(setIsOpen(false));

  // Блокировка скролла
  useLockBodyScroll();

  // Текущая отображаемая опция
  const items = Object.values(options);
  const currentOption = options?.[currentSort] || items[0];

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  if (!options || items.length === 0) return null;

  return (
    <div className={style.dropdown} ref={dropdownRef}>
      <button
        type="button"
        className={style.triggerButton}
        onClick={(e) => {
          e?.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Выбрать сортировку"
      >
        <span className={style.label}>{currentOption?.label}</span>
        <span
          className={`${style.icon} ${isOpen ? style.iconOpen : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className={style.menu} role="listbox">
          {items.map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={currentSort === option.id}
              className={`${style.menuItem} ${
                currentSort === option.id ? style.menuItemActive : ''
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
