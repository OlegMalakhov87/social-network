import { Chip } from '../../../ui';

import styles from './Tabs.module.css';

/**
 * Переключает вкладки.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{id: string, label: string, icon?: React.ReactNode}>} [props.items=[]] - Вкладки с идентификатором, текстом и иконкой
 * @param {string} props.value - Идентификатор выбранной вкладки
 * @param {Function} props.onChange - Обработчик смены вкладки
 * @param {boolean} [props.disabled=false] - Признак блокировки
 * @returns {JSX.Element} Вкладки.
 */

export const Tabs = ({ items = [], value, onChange, disabled = false }) => {
  return (
    <nav className={styles.tabs} aria-label="Навигация">
      {items.map((item) => (
        <Chip
          key={item.id}
          item={{
            id: item.id,
            name: item.icon ? `${item.icon} ${item.label}` : item.label,
          }}
          filter={value}
          onChangeButtonFilter={onChange}
          disabled={disabled}
        />
      ))}
    </nav>
  );
};
