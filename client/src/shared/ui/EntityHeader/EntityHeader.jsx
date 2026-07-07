import style from './EntityHeader.module.css';

/**
 * Универсальный header карточки.
 *
 * Используется внутри BaseCard.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.children]
 * @param {React.ReactNode} [props.leftSlot]
 * @param {React.ReactNode} [props.rightSlot]
 */

export const EntityHeader = ({ children, leftSlot, rightSlot }) => {
  return (
    <header className={style.header}>
      {leftSlot}

      <div className={style.content}>{children}</div>

      {rightSlot}
    </header>
  );
};
