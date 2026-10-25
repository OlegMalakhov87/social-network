import { getTrackMeta } from '..';
import { EntityDates, EntityInfoList, EntityStats } from '../../../shared/ui';
import { formatViews } from '../../../shared/utils';

import style from './TrackMeta.module.css';

/**
 * Отображает сведения о треке.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.track - Трек.
 * @param {string} [props.mode] - Режим отображения.
 * @returns {JSX.Element} Разметка сведений.
 */
export const TrackMeta = ({ track, mode }) => {
  const meta = getTrackMeta(track, mode);

  return (
    <div className={style.meta}>
      <h3 className={style.title}>{track.title}</h3>

      <EntityInfoList items={meta.details} />

      <EntityDates {...meta.dates} />

      <EntityStats
        items={[
          {
            icon: '▶',
            value: formatViews(track.playsCount),
          },
        ]}
      />
    </div>
  );
};
