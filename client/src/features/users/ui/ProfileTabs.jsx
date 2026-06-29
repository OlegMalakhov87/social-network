import style from './ProfileTabs.module.css';
import { Button } from '../../../shared/ui';
import { classNames } from '../../../shared/lib';

/**
 * Вкладки профиля.
 *
 * @param {Object} props
 * @param {Array<{id:string,label:string}>} props.tabs
 * @param {string} props.activeTab
 * @param {(tab:string)=>void} props.onChange
 */
export const ProfileTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <nav className={style.tabs} aria-label="Навигация профиля">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onChange(tab.id)}
          className={classNames(
            style.tab,
            activeTab === tab.id && style.active
          )}
        >
          {tab.label}
        </Button>
      ))}
    </nav>
  );
};
