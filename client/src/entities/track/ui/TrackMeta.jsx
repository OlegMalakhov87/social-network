import { getTrackMeta } from '..';
import { EntityDates, EntityInfoList, EntityStats } from '../../../shared/ui';
import { formatViews } from '../../../shared/utils';
import style from './TrackMeta.module.css';

/**
 * Информация о треке.
 *
 * @param {Object} props
 * @param {Object} props.track - данные трека
 * @param {string} [props.mode] - режим отображения
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
