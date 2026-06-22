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
  message = 'Загрузка...',
  size = 'medium',
  fullPage = false,
  className = '',
}) => {
  const wrapperClass = `${fullPage ? style.fullPage : ''} ${className}`.trim();

  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className={`${style.spinner} ${style[size]}`} />
      {message && <p className={style.message}>{message}</p>}
    </div>
  );
};
