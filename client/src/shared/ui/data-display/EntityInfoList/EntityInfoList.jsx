import { classNames } from '../../../utils';

import styles from './EntityInfoList.module.css';

/**
 * Отображает список сведений о сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{label: string, value: React.ReactNode}>} [props.items=[]] - Строки с подписью и значением
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element|null} Список сведений или пустой результат без строк.
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
