import { classNames } from '../../../utils';

import style from './Alert.module.css';

/**
 * Отображает предупреждение с заголовком и текстом.
 *
 * @param {Object} props - Свойства компонента
 * @param {'success'|'error'|'info'|'warning'} props.variant - Вид предупреждения
 * @param {string} props.title - Заголовок предупреждения
 * @param {boolean} props.closable - Признак кнопки закрытия
 * @param {React.ReactNode} props.children - Текст предупреждения
 * @param {Function} props.onClose - Обработчик закрытия
 * @returns {JSX.Element|null} Предупреждение или пустой результат без текста.
 */

export const Alert = ({ variant, title, closable, children, onClose }) => {
  if (!children) return null;

  const icons = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  };

  const alertClassName = classNames(style.notification, style[variant]);

  return (
    <div className={alertClassName}>
      <span className={style.icon}>{icons[variant]}</span>
      <span className={style.title}>{title}</span>
      <span className={style.message}>{children}</span>
      {closable && (
        <button
          className={style.closeButton}
          onClick={onClose}
          aria-label="Закрыть уведомление"
        >
          ✕
        </button>
      )}
    </div>
  );
};
