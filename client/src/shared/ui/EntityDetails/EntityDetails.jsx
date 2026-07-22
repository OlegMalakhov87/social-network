import { EntityInfoList } from '..';

/**
 * Универсальный блок информационных полей сущности.
 *
 * @param {Object} props
 * @param {Object[]} props.items - массив информационных полей
 */

export const EntityDetails = ({ items = [] }) => {
  if (!items.length) return null;

  return <EntityInfoList items={items} />;
};
