import { classNames } from '../../lib';
import style from './IconButton.module.css';

export const IconButton = ({
  icon,
  variant = 'default',
  size = 'md',
  onClick,
  disabled = false,
  ariaLabel,
  className,
}) => {
  return (
    <button
      type="button"
      className={classNames(
        style.button,
        style[variant],
        style[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
};
