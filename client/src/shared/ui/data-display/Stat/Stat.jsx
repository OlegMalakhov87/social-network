import { classNames } from '../../../utils';

import styles from './Stat.module.css';

/**
 * Отображает один показатель.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} [props.icon] - Иконка показателя
 * @param {string|number} props.value - Значение показателя
 * @param {string} [props.label] - Подпись показателя
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Показатель.
 */

export const Stat = ({ icon, value, label, className = '' }) => {
  return (
    <div className={classNames(styles.stat, className)}>
      {icon && <span className={styles.icon}>{icon}</span>}

      <span className={styles.value}>{value}</span>

      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};
