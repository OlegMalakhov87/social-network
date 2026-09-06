import styles from './EntityInfoList.module.css';
import { classNames } from '../../../utils';

/**
 * Универсальный список информационных полей для сущности.
 *
 * @param {Object} props
 * @param {Array<{label: string, value: React.ReactNode}>} props.items - массив характеристик
 * @param {string} [props.className=''] - дополнительный класс
 */

export const EntityInfoList = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <dl className={classNames(styles.list, className)}>
      {items.map(({ label, value }) => (
        <div key={label} className={styles.row}>
          <dt className={styles.label}>{label}</dt>
          <dd className={styles.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};
