import { classNames } from '../../../utils';
import style from './Stat.module.css';

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
    <div className={classNames(style.stat, className)}>
      {icon && <span className={style.icon}>{icon}</span>}

      <span className={style.value}>{value}</span>

      {label && <span className={style.label}>{label}</span>}
    </div>
  );
};
