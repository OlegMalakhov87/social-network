import { getTrackMeta } from '..';
import { formatViews } from '../../../shared/lib';
import { EntityDates, EntityDetails, EntityStats } from '../../../shared/ui';
import style from './TrackMeta.module.css';

/**
 * Информация о треке.
 *
 * @param {Object} props
 * @param {Object} props.track
 * @param {string} props.mode
 */

export const TrackMeta = ({ track, mode }) => {
  const meta = getTrackMeta(track, mode);

  return (
    <div className={style.meta}>
      <h3 className={style.title}>{track.title}</h3>

      <EntityDetails items={meta.details} />

      <EntityDates {...meta.dates} />

      <EntityStats
        items={[
          {
            icon: '▶',
            value: formatViews(track.playCount),
          },
        ]}
      />
    </div>
  );
};
