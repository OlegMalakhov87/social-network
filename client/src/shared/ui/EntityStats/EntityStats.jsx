import { Stat } from '..';
import { classNames } from '../../lib';
import style from './EntityStats.module.css';

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
    <div className={classNames(style.stats, className)}>
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
