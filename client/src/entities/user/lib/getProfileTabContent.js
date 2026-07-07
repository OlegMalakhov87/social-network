import { PROFILE_TABS_MAP } from '..';

/**
 * Возвращает компонент активной вкладки профиля.
 *
 * @param {Object} ctx
 * @param {string} ctx.activeTab
 * @param {Object} ctx.tabProps
 * @returns {React.ReactNode}
 */

export const getProfileTabContent = ({ activeTab, tabProps }) => {
  const tab = PROFILE_TABS_MAP[activeTab];

  if (!tab) return null;

  const Component = tab.Component;

  return <Component {...tab.getProps(tabProps)} />;
};
