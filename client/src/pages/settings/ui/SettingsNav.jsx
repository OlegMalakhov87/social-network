import { Button, Tabs } from '../../../shared/ui';

import style from './SettingsPage.module.css';

/**
 * Отображает навигацию настроек.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<{id: string, label: string, icon: string}>} props.items - Разделы настроек
 * @param {string} props.activeTab - Идентификатор активного раздела
 * @param {Function} props.onChange - Обработчик смены раздела
 * @returns {JSX.Element} Разметка навигации.
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
            ariaCurrent={activeTab === item.id ? 'page' : undefined}
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
