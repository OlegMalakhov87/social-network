import { classNames } from '../../../utils';

import styles from './SegmentedControl.module.css';

/**
 * Переключает один вариант из нескольких.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{value: string, label: string, icon?: string}>} props.options - Варианты со значением, текстом и иконкой
 * @param {string} props.value - Значение выбранного варианта
 * @param {(value: string) => void} props.onChange - Обработчик смены варианта
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @returns {JSX.Element} Переключатель вариантов.
 */

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={classNames(styles.root, className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={classNames(
            styles.button,
            value === option.value && styles.active
          )}
          onClick={() => onChange(option.value)}
          disabled={disabled}
          aria-pressed={value === option.value}
        >
          {option.icon && <span className={styles.icon}>{option.icon}</span>}

          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
