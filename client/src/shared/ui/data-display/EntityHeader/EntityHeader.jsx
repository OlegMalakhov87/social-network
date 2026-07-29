import { classNames } from '../../../lib';
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
 * @param {string} [props.className=''] - дополнительный CSS класс
 */

export const EntityHeader = ({
  leftSlot,
  rightSlot,
  children,
  className = '',
}) => {
  return (
    <header className={classNames(style.header, className)}>
      {leftSlot && <div className={style.left}>{leftSlot}</div>}
      {children && <div className={style.content}>{children}</div>}
      {rightSlot && <div className={style.right}>{rightSlot}</div>}
    </header>
  );
};
