import { Tabs } from '..';
import styles from './Toolbar.module.css';

/**
 * Верхняя панель управления профилем.
 *
 * @param {Object} props
 * @param {Array<{id:string,label:string,icon?:React.ReactNode}>} props.tabs - Мапа для выбора вкладки профиля.
 * @param {string} props.activeTab - Активная вкладка профиля.
 * @param {(id:string)=>void} props.onTabChange - Функция для изменения активной вкладки профиля.
 * @param {React.ReactNode} props.leftSlot - Левая часть панели управления профилем.
 * @param {React.ReactNode} props.rightSlot - Правая часть панели управления профилем.
 */

export const Toolbar = ({
  tabs,
  activeTab,
  onTabChange,
  leftSlot,
  rightSlot,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        {leftSlot ?? (
          <Tabs items={tabs} value={activeTab} onChange={onTabChange} />
        )}
      </div>

      {rightSlot && <div className={styles.right}>{rightSlot}</div>}
    </div>
  );
};
