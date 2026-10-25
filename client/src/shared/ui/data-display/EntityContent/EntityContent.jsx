import style from './EntityContent.module.css';

/**
 * Отображает содержимое сущности.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Содержимое сущности
 * @returns {JSX.Element|null} Содержимое или пустой результат без него.
 */

export const EntityContent = ({ children }) => {
  if (!children) return null;

  return <section className={style.content}>{children}</section>;
};
