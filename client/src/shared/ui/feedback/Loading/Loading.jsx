import { classNames } from '../../../utils';

import styles from './Loading.module.css';

/**
 * Отображает индикатор загрузки.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} [props.children] - Содержимое вместо текста загрузки
 * @param {string} [props.message='Загрузка...'] - Текст под индикатором
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Размер индикатора
 * @param {boolean} [props.fullPage=false] - Центрирование на всю доступную область
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Индикатор загрузки.
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
