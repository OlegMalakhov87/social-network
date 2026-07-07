import style from './Loading.module.css';

/**
 * Универсальный индикатор загрузки.
 * @param {Object} props
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
  const wrapperClass = `${fullPage ? style.fullPage : ''} ${className}`.trim();

  const spinnerClass = `
    ${style.spinner}
    ${style[size]}
`.trim();

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-label={message}
      aria-busy="true"
    >
      <div className={spinnerClass} />
      {message && <p className={style.message}>{children ?? message}</p>}
    </div>
  );
};
