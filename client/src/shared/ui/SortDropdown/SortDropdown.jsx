import { useState, useRef, useEffect } from 'react';
import style from './SortDropdown.module.css';

/**
 * Выпадающий список сортировки.
 * @param {Object} props
 * @param {Object} props.options - объект с вариантами сортировки (ключи — id, значения — { id, label })
 * @param {string} props.currentSort - текущий выбранный ключ сортировки
 * @param {Function} props.onChange - колбэк при выборе варианта (получает id)
 */
export const SortDropdown = ({ options, currentSort, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Текущая отображаемая опция
  const currentOption = options?.[currentSort] || Object.values(options ?? {})[0];

  const handleSelect = (optionId) => {
    onChange(optionId);
    setIsOpen(false);
  };

  if (!options || Object.keys(options).length === 0) return null;

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
      >
        <span className={style.label}>{currentOption?.label}</span>
        <span className={`${style.icon} ${isOpen ? style.iconOpen : ''}`} aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <ul className={style.menu} role="listbox">
          {Object.values(options).map((option) => (
            <li
              key={option.id}
              role="option"
              aria-selected={currentSort === option.id}
              className={`${style.menuItem} ${
                currentSort === option.id ? style.menuItemActive : ''
              }`}
              onClick={(e) => {
                e?.stopPropagation();
                handleSelect(option.id);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
