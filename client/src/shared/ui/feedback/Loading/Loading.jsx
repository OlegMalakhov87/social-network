import { classNames } from '../../../utils';
import styles from './Loading.module.css';

/**
 * Универсальный индикатор загрузки.
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - дополнительный контент над спиннером
 * @param {string} [props.message='Загрузка...'] - текст под спиннером
 * @param {'small'|'medium'|'large'} [props.size='medium'] - размер спиннера
 * @param {boolean} [props.fullPage=false] - если true, спиннер центрируется на всю доступную область
 * @param {string} [props.className] - дополнительный CSS-класс
 */
export const Loading = ({
  children,
  message = 'Загрузка...',
  size = 'medium',
  fullPage = false,
  className = '',
}) => {
  const wrapperClass = classNames(
    styles.wrapper,
    fullPage && styles.fullPage,
    className
  );

  const spinnerClass = classNames(styles.spinner, styles[size]);

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-label={message}
      aria-busy="true"
    >
      <div className={spinnerClass} />

      {message && <p className={styles.message}>{children ?? message}</p>}
    </div>
  );
};
