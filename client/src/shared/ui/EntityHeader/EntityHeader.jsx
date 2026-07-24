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
 */

export const EntityHeader = ({ leftSlot, rightSlot, children }) => {
  return (
    <header className={style.header}>
      {leftSlot && <div className={style.left}>{leftSlot}</div>}
      {children && <div className={style.content}>{children}</div>}
      {rightSlot && <div className={style.right}>{rightSlot}</div>}
    </header>
  );
};
