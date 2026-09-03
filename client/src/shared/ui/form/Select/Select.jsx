import { Text } from '../../../ui';
import { classNames } from '../../../utils';
import styles from './Select.module.css';

/**
 * Универсальный Select.
 *
 * @param {Object} props
 * @param {string} [props.label] - текст лейбла
 * @param {boolean} [props.required=false] - обязательное поле
 * @param {string|number|boolean} props.value - значение выбранной опции
 * @param {(value: string|number|boolean)=>void} props.onChange - обработчик изменения
 * @param {Array<{value: string|number|boolean, label: string}>} props.options - опции
 * @param {boolean} [props.disabled=false] - заблокирован ли селект
 * @param {boolean} [props.fullWidth=true] - растянуть на всю ширину контейнера
 * @param {string} [props.className=''] - дополнительный CSS класс для select
 * @param {string} [props.id] - id для связи label и select
 * @param {string} [props.helperText] - подсказка под полем
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
}) => {
  const selectId =
    id ??
    (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  const handleChange = (e) => {
    const raw = e.target.value;
    const match = options.find((option) => String(option.value) === raw);
    onChange(match ? match.value : raw);
  };

  return (
    <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}>
      {label && (
        <Text variant="body2">
          {label}
          {required && <span className={styles.required}>*</span>}
        </Text>
      )}
      <select
        id={selectId}
        className={classNames(styles.select, className)}
        value={String(value)}
        disabled={disabled}
        onChange={handleChange}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && (
        <Text variant="caption" className={styles.helper}>
          {helperText}
        </Text>
      )}
    </div>
  );
};
