import style from './EntityContent.module.css';

/**
 * Универсальный контейнер контента сущности.
 *
 * Используется внутри BaseCard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */

export const EntityContent = ({ children }) => {
  if (!children) return null;

  return <section className={style.content}>{children}</section>;
};
