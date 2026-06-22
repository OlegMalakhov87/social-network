import styles from './FilterButton.module.css';

/**
 * Кнопка-фильтр (например, вкладки категорий).
 * @param {Object} props
 * @param {Object} props.cat - объект категории с полями { id, name }
 * @param {string} props.filter - текущий активный фильтр
 * @param {Function} props.onChangeButtonFilter - колбэк при выборе (получает id категории)
 */
export const FilterButton = ({ cat, filter, onChangeButtonFilter }) => {
  if (!cat?.id) return null; // защита от невалидных данных

  const isActive = filter === cat.id;

  return (
    <button
      className={`${styles.filterButton} ${isActive ? styles.active : ''}`}
      onClick={() => onChangeButtonFilter(cat.id)}
      aria-pressed={isActive}
    >
      {cat.name}
    </button>
  );
};
