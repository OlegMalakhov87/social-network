import { classNames } from '../../../utils';
import styles from './Stat.module.css';

/**
 * Один показатель статистики.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - иконка статистики
 * @param {string|number} props.value - значение статистики
 * @param {string} [props.label] - лейбл статистики
 * @param {string} [props.className=''] - дополнительный CSS класс
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
