import style from './ContentEmptyState.module.css';
import { EmptyState } from '..';

/**
 * Универсальное пустое состояние для вкладок и страниц.
 *
 * Используется внутри ProfilePage, LibraryPage,
 * FriendsPage, SearchPage и других разделов.
 *
 * @param {Object} props
 * @param {string} props.icon - иконка пустого состояния
 * @param {string} props.title - заголовок пустого состояния
 * @param {string} props.description - описание пустого состояния
 * @param {React.ReactNode} props.action - действие для пустого состояния
 */
export const ContentEmptyState = ({ icon, title, description, action }) => {
  return (
    <div className={style.wrapper}>
      <EmptyState icon={icon} title={title} description={description} />

      {action && <div className={style.actions}>{action}</div>}
    </div>
  );
};
