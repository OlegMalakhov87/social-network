import { Button, Tabs } from '../../../shared/ui';
import style from './SettingsPage.module.css';

/**
 * Навигация по разделам настроек: вертикальные кнопки на десктопе, Tabs на мобильных.
 *
 * @param {Object} props
 * @param {Array} props.items - массив объектов с id, label и icon
 * @param {string} props.activeTab - id активного раздела
 * @param {Function} props.onChange - функция для изменения активного раздела
 */
export const SettingsNav = ({ items, activeTab, onChange }) => {
  return (
    <>
      <nav className={style.sidebarNavDesktop} aria-label="Разделы настроек">
        {items.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? 'primary' : 'ghost'}
            fullWidth
            leftIcon={item.icon}
            className={style.menuButton}
            onClick={() => onChange(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className={style.sidebarNavMobile}>
        <Tabs items={items} value={activeTab} onChange={onChange} />
      </div>
    </>
  );
};
