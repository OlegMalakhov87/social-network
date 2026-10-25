import { useMemo, useRef, useState } from 'react';

import { useEscapeKey, useOutsideClick } from '../../../hooks';
import { Text } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './Select.module.css';

/**
 * Отображает раскрывающийся список.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} [props.label] - Подпись поля
 * @param {boolean} [props.required=false] - Признак обязательного поля
 * @param {string|number|boolean} props.value - Значение выбранного варианта
 * @param {(value: string|number|boolean) => void} [props.onChange] - Обработчик изменения
 * @param {Array<{value: string|number|boolean, label: string}>} props.options - Варианты списка
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {boolean} [props.fullWidth=true] - Растягивание на всю ширину
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {string} [props.id] - Идентификатор поля для связи с подписью
 * @param {string} [props.helperText] - Подсказка под полем
 * @param {string} [props.error] - Текст ошибки
 * @param {'down'|'up'} [props.menuPlacement='down'] - Направление раскрытия списка
 * @returns {JSX.Element} Раскрывающийся список.
 */

export const Select = ({
  label,
  required = false,
  value,
  onChange,
  options,
  disabled = false,
  fullWidth = true,
  className = '',
  id,
  helperText,
  error,
  menuPlacement = 'down',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectId =
    id ??
    (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const normalizedValue = String(value ?? '');
  const selectedOption = useMemo(
    () =>
      options.find((option) => String(option.value) === normalizedValue) ??
      options[0],
    [options, normalizedValue]
  );

  /**
   * Выбирает значение и закрывает список.
   *
   * @param {string|number|boolean} optionValue - Значение варианта
   * @returns {void}
   */
  const handleSelect = (optionValue) => {
    const match = options.find(
      (option) => String(option.value) === String(optionValue)
    );
    onChange?.(match ? match.value : optionValue);
    setIsOpen(false);
  };

  useOutsideClick(containerRef, () => setIsOpen(false));
  useEscapeKey(() => setIsOpen(false));

  return (
    <div
      ref={containerRef}
      className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}
    >
      {label && (
        <Text variant="body2" as="label" htmlFor={selectId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </Text>
      )}

      <button
        id={selectId}
        type="button"
        className={classNames(
          styles.select,
          className,
          error && styles.error,
          isOpen && styles.open
        )}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.valueText}>{selectedOption?.label}</span>
        <span className={styles.icon} aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <ul
          className={classNames(
            styles.menu,
            menuPlacement === 'up' && styles.menuUp
          )}
          role="listbox"
          aria-labelledby={selectId}
        >
          {options.map((option) => {
            const optionKey = String(option.value);
            const isSelected = optionKey === normalizedValue;

            return (
              <li
                key={optionKey}
                className={classNames(
                  styles.option,
                  isSelected && styles.optionSelected
                )}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <Text variant="caption" className={styles.errorText}>
          {error}
        </Text>
      ) : (
        helperText && (
          <Text variant="caption" className={styles.helper}>
            {helperText}
          </Text>
        )
      )}
    </div>
  );
};
