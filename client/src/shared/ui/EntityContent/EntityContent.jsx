import style from './EntityContent.module.css';

/**
 * Универсальный контейнер контента сущности.
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент сущности
 */

export const EntityContent = ({ children }) => {
  if (!children) return null;

  return <section className={style.content}>{children}</section>;
};
