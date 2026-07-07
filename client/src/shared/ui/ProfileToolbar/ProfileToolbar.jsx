import { Tabs } from '..';
import styles from './ProfileToolbar.module.css';

/**
 * Верхняя панель управления профилем.
 */

export const ProfileToolbar = ({
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
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={onTabChange}
          />
        )}
      </div>

      {rightSlot && (
        <div className={styles.right}>
          {rightSlot}
        </div>
      )}
    </div>
  );
};