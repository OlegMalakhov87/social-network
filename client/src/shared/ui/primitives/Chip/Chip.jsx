import styles from './Chip.module.css';
import { classNames } from '../../../lib';

/**
 * Кнопка-фильтр (например, вкладки категорий).
 * @param {Object} props
 * @param {Object} props.item - объект категории с полями { id, name }
 * @param {string} props.filter - текущий активный фильтр
 * @param {Function} props.onChangeButtonFilter - колбэк при выборе (получает id категории)
 */
export const Chip = ({ item, filter, onChangeButtonFilter }) => {
  if (!item?.id) return null; // защита от невалидных данных

  const isActive = filter === item.id;

  return (
    <button
      type="button"
      className={classNames(styles.filterButton, isActive && styles.active)}
      onClick={() => onChangeButtonFilter(item.id)}
      aria-pressed={isActive}
    >
      {item.name}
    </button>
  );
};
