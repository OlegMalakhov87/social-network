import { classNames } from '../../../utils';

import style from './EntityHeader.module.css';

/**
 * Отображает заголовок сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} [props.leftSlot] - Левая область заголовка
 * @param {React.ReactNode} [props.rightSlot] - Правая область заголовка
 * @param {React.ReactNode} [props.bottomSlot] - Область под основной строкой
 * @param {React.ReactNode} [props.children] - Содержимое заголовка
 * @param {string} [props.className=''] - Дополнительный CSS-класс
 * @returns {JSX.Element} Заголовок сущности.
 */
export const EntityHeader = ({
  leftSlot,
  rightSlot,
  bottomSlot,
  children,
  className = '',
}) => {
  return (
    <header className={classNames(style.header, className)}>
      <div className={style.row}>
        {leftSlot && <div className={style.left}>{leftSlot}</div>}
        {children && <div className={style.content}>{children}</div>}
        {rightSlot && <div className={style.right}>{rightSlot}</div>}
      </div>
      {bottomSlot && <div className={style.bottom}>{bottomSlot}</div>}
    </header>
  );
};
