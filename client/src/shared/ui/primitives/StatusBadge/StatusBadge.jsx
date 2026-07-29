import { classNames } from '../../../lib';
import style from './StatusBadge.module.css';

/**
 * Универсальный бейдж статуса.
 *
 * @param {Object} props
 * @param {'online'|'offline'|'success'|'warning'|'error'|'info'} props.status - статус
 * @param {string} props.label - лейбл статуса
 * @param {'sm'|'md'|'lg'} [props.size='md'] - размер статуса
 * @param {string} [props.className=''] - дополнительный CSS класс
 */
export const StatusBadge = ({
  status = 'offline',
  label,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={classNames(style.badge, style[status], style[size], className)}
    >
      <span className={style.dot} />

      {label && <span className={style.label}>{label}</span>}
    </div>
  );
};
