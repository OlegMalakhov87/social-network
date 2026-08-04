import { classNames } from '../../../utils';
import style from './Badge.module.css';

/**
 * Универсальный бейдж.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент бейджа
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'} [props.variant] - вариант бейджа
 * @param {'sm'|'md'} [props.size] - размер бейджа
 * @param {string} [props.className] - дополнительный класс
 */

export const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
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
