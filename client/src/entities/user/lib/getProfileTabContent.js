import { PROFILE_TABS_MAP } from '..';

/**
 * Возвращает компонент активной вкладки профиля.
 * @param {string} activeTab - активная вкладка
 * @param {Object} tabProps - пропсы для вкладки
 * @returns {JSX.Element} - компонент активной вкладки профиля
 */

export const getProfileTabContent = (activeTab, tabProps) => {
  const tab = PROFILE_TABS_MAP[activeTab];

  if (!tab) return null;

  const Component = tab.Component;

  return <Component {...tab.getProps(tabProps)} />;
};
