import clsx from 'clsx';
import style from './StatusBadge.module.css';

/**
 * Универсальный бейдж статуса.
 *
 * @param {Object} props
 * @param {'online'|'offline'|'success'|'warning'|'error'|'info'} props.status
 * @param {string} props.label
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export const StatusBadge = ({
  status = 'offline',
  label,
  size = 'md',
  className,
}) => {
  return (
    <div
      className={clsx(
        style.badge,
        style[status],
        style[size],
        className
      )}
    >
      <span className={style.dot} />

      {label && (
        <span className={style.label}>
          {label}
        </span>
      )}
    </div>
  );
};