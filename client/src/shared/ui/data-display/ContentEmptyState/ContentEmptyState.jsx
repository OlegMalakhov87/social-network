import { EmptyState } from '../../../ui';

import style from './ContentEmptyState.module.css';

/**
 * Отображает пустое состояние раздела.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.icon - Иконка пустого состояния
 * @param {string} props.title - Заголовок пустого состояния
 * @param {string} props.description - Описание пустого состояния
 * @param {React.ReactNode} [props.action] - Действие под сообщением
 * @returns {JSX.Element} Пустое состояние раздела.
 */
export const ContentEmptyState = ({ icon, title, description, action }) => {
  return (
    <div className={style.wrapper}>
      <EmptyState icon={icon} title={title} description={description} />

      {action && <div className={style.actions}>{action}</div>}
    </div>
  );
};
