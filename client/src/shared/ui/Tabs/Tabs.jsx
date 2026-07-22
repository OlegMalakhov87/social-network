import { Chip } from '..';
import styles from './Tabs.module.css';

/**
 * Универсальные вкладки для панели инструментов.
 *
 * @param {Object} props
 * @param {Array<Object>} props.items - массив вкладок (идентификатор, текст, иконка)
 * @param {string} props.value - значение выбранной вкладки
 * @param {Function} props.onChange - функция изменения выбранной вкладки
 */

export const Tabs = ({ items = [], value, onChange }) => {
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
        />
      ))}
    </nav>
  );
};
