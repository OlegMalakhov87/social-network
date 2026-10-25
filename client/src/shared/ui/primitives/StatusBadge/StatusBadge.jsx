import { classNames } from '../../../utils';

import style from './StatusBadge.module.css';

/**
 * Отображает значок статуса.
 *
 * @param {Object} props - Свойства компонента
 * @param {'online'|'offline'|'success'|'warning'|'error'|'info'} [props.status='offline'] - Статус: в сети, не в сети, успех, предупреждение, ошибка или сведения
 * @param {string} [props.label] - Подпись статуса
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Размер значка
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Значок статуса.
 */
export const StatusBadge = ({
  status = 'offline',
  label,
  size = 'md',
  className = '',
}) => {
  return (
    <div
      className={classNames(style.badge, style[status], style[size], className)}
    >
      <span className={style.dot} />

      {label && <span className={style.label}>{label}</span>}
    </div>
  );
};
