import { classNames } from '../../../utils';
import styles from './Chip.module.css';

/**
 * Кнопка-фильтр (например, вкладки категорий).
 * @param {Object} props
 * @param {Object} props.item - объект категории с полями { id, name }
 * @param {string} props.filter - текущий активный фильтр
 * @param {Function} props.onChangeButtonFilter - колбэк при выборе (получает id категории)
 * @param {boolean} [props.disabled=false] - заблокирован ли фильтр
 * @param {string} [props.ariaLabel] - aria-label для кнопки
 */
export const Chip = ({
  item,
  filter,
  onChangeButtonFilter,
  disabled = false,
  ariaLabel,
}) => {
  if (!item?.id) return null;

  const isActive = filter === item.id;

  return (
    <button
      type="button"
      className={classNames(styles.filterButton, isActive && styles.active)}
      onClick={() => onChangeButtonFilter(item.id)}
      aria-pressed={isActive}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {item.name}
    </button>
  );
};
