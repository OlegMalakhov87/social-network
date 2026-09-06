import { Stat } from '../../../ui';
import { classNames } from '../../../utils';
import styles from './EntityStats.module.css';

/**
 * Панель статистики сущности.
 *
 * @param {Object} props
 * @param {Object[]} props.items - массив статистики
 * @param {string} [props.className=''] - дополнительный класс
 */

export const EntityStats = ({ items = [], className = '' }) => {
  if (!items.length) return null;

  return (
    <div className={classNames(styles.stats, className)}>
      {items.map((item) => (
        <Stat
          key={item.key ?? item.label ?? item.icon}
          icon={item.icon}
          value={item.value}
          label={item.label}
        />
      ))}
    </div>
  );
};
