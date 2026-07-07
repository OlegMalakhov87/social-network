import { classNames } from '../../lib';
import styles from './ButtonGroup.module.css';

/**
 * Контейнер для группы кнопок.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} props.align
 * @param {string} props.className
 */

export const ButtonGroup = ({
  children,
  align = 'end',
  className,
}) => {
  return (
    <div
      className={classNames(
        styles.group,
        styles[align],
        className
      )}
    >
      {children}
    </div>
  );
};