import { classNames } from '../../../lib';
import styles from './SegmentedControl.module.css';

/**
 * Сегментированный переключатель.
 *
 * @param {Object} props
 * @param {Array<{value:string,label:string,icon?:string}>} props.options - массив опций (значение, текст, иконка)
 * @param {string} props.value - значение выбранной опции
 * @param {(value:string)=>void} props.onChange - функция изменения выбранной опции
 * @param {string} [props.className=''] - дополнительный CSS класс
 */

export const SegmentedControl = ({
  options,
  value,
  onChange,
  className = '',
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
        >
          {option.icon && <span className={styles.icon}>{option.icon}</span>}

          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
};
