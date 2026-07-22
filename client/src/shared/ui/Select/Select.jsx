import { classNames } from '../../lib';
import styles from './Select.module.css';

/**
 * Универсальный Select.
 *
 * @param {Object} props
 * @param {string} props.value - значение выбранной опции
 * @param {(value:string)=>void} props.onChange - функция изменения выбранной опции
 * @param {Array<{value:string,label:string}>} props.options - массив опций (значение, текст)
 * @param {boolean} props.disabled - заблокирован ли селект
 * @param {string} [props.className=''] - дополнительный CSS класс
 */

export const Select = ({
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}) => {
  return (
    <select
      className={classNames(styles.select, className)}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
