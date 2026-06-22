import style from './FriendsHeader.module.css';
import { FilterButton } from '../../../shared/ui';

/**
 * Шапка страницы друзей с заголовком, статистикой и фильтрами.
 * @param {Object} props
 * @param {string} props.filter - текущий фильтр
 * @param {Function} props.onFilterChange - смена фильтра
 * @param {Array} props.categories - список категорий
 * @param {number} props.friendsCount - количество человек
 */

export const FriendsHeader = ({ filter, onFilterChange, categories, friendsCount }) => {
  const getFriendsText = (count) => {
    if (count === 1) return 'человек';
    if (count >= 2 && count <= 4) return 'человека';
    return 'человек';
  };

  return (
    <div className={style.header}>
      <h2 className={style.title}>Друзья</h2>
      <span className={style.stats}>
        {friendsCount} {getFriendsText(friendsCount)}
      </span>
      <div className={style.filters}>
        {categories.map((cat) => (
          <FilterButton
            key={cat.id}
            cat={cat}
            filter={filter}
            onChangeButtonFilter={onFilterChange}
          />
        ))}
      </div>
    </div>
  );
};
