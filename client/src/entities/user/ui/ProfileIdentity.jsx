import styles from './ProfileIdentity.module.css';

/**
 * Левая часть карточки профиля.
 *
 * Используется внутри UserProfileCard.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент левой части карточки профиля
 */

export const ProfileIdentity = ({ children }) => {
  return <aside className={styles.identity}>{children}</aside>; 
};