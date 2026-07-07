import { classNames } from '../../lib';
import style from './Badge.module.css';

/**
 * Универсальный бейдж.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.className]
 */

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
}) => {
  return (
    <span
      className={classNames(
        style.badge,
        style[variant],
        style[size],
        className
      )}
    >
      {children}
    </span>
  );
};
