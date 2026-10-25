import { Tabs } from '../../../ui';

import styles from './Toolbar.module.css';

/**
 * Отображает панель инструментов.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{id: string, label: string, icon?: React.ReactNode}>} [props.tabs] - Вкладки с идентификатором, текстом и иконкой
 * @param {string} [props.activeTab] - Идентификатор выбранной вкладки
 * @param {Function} [props.onTabChange] - Обработчик смены вкладки
 * @param {React.ReactNode} [props.leftSlot] - Левая область панели
 * @param {React.ReactNode} [props.rightSlot] - Правая область панели
 * @param {boolean} [props.disabled=false] - Признак блокировки вкладок
 * @returns {JSX.Element} Панель инструментов.
 */

export const Toolbar = ({
  tabs,
  activeTab,
  onTabChange,
  leftSlot,
  rightSlot,
  disabled = false,
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        {leftSlot ?? (
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={onTabChange}
            disabled={disabled}
          />
        )}
      </div>

      {rightSlot && <div className={styles.right}>{rightSlot}</div>}
    </div>
  );
};
