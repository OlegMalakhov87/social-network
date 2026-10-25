import { classNames } from '../../../utils';

import styles from './Chip.module.css';

/**
 * Переключает фильтр.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} props.item - Категория с идентификатором и названием
 * @param {string} props.filter - Идентификатор активного фильтра
 * @param {Function} props.onChangeButtonFilter - Обработчик выбора, получает идентификатор категории
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @param {string} [props.ariaLabel] - Значение атрибута aria-label
 * @returns {JSX.Element|null} Кнопка фильтра или пустой результат без категории.
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
