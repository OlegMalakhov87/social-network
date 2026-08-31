import { classNames } from '../../../utils';
import style from './EntityHeader.module.css';

/**
 * Универсальный header карточки.
 *
 * Используется внутри BaseCard.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children] - контент заголовка
 * @param {React.ReactNode} [props.leftSlot] - левое поле заголовка
 * @param {React.ReactNode} [props.rightSlot] - правое поле заголовка
 * @param {React.ReactNode} [props.bottomSlot] - блок под основной строкой заголовка
 * @param {string} [props.className=''] - дополнительный CSS класс
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
