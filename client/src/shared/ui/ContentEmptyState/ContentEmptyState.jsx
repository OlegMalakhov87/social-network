import style from './ContentEmptyState.module.css';
import { EmptyState } from '..';

/**
 * Универсальное пустое состояние для вкладок и страниц.
 *
 * Используется внутри ProfilePage, LibraryPage,
 * FriendsPage, SearchPage и других разделов.
 *
 * @param {Object} props
 * @param {string} props.icon
 * @param {string} props.title
 * @param {string} props.description
 * @param {React.ReactNode} props.action
 */
export const ContentEmptyState = ({ icon, title, description, action }) => {
  return (
    <div className={style.wrapper}>
      <EmptyState icon={icon} title={title} description={description} />

      {action && <div className={style.actions}>{action}</div>}
    </div>
  );
};
