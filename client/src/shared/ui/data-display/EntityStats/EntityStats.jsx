import { Stat } from '../../../ui';
import { classNames } from '../../../utils';

import styles from './EntityStats.module.css';

/**
 * Отображает показатели сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object[]} [props.items=[]] - Показатели с иконкой, значением и подписью
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element|null} Показатели или пустой результат без них.
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
