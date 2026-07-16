import { EntityInfoList } from '..';

/**
 * Универсальный блок характеристик сущности.
 *
 * Используется:
 * Video
 * Track
 * Album
 * Playlist
 *
 * @param {Object} props
 * @param {Array} props.items
 */

export const EntityDetails = ({ items = [] }) => {
  if (!items.length) return null;

  return <EntityInfoList items={items} />;
};
