import { Chip } from '..';
import styles from './Tabs.module.css';

/**
 * Универсальные вкладки для панели инструментов.
 *
 * @param {Object} props
 * @param {Array<{id:string,label:string,icon?:React.ReactNode}>} props.items
 * @param {string} props.value
 * @param {(id:string)=>void} props.onChange
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
