import { classNames } from '../../lib';
import styles from './Select.module.css';

/**
 * Универсальный Select.
 *
 * @param {Object} props
 * @param {string} props.value
 * @param {(value:string)=>void} props.onChange
 * @param {Array<{value:string,label:string}>} props.options
 * @param {boolean} props.disabled
 * @param {string} props.className
 */

export const Select = ({
  value,
  onChange,
  options,
  disabled = false,
  className,
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
