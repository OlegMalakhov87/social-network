import { getVideoMeta } from '..';
import { formatViews } from '../../../../shared/lib';
import { EntityDates, EntityDetails, EntityStats } from '../../../../shared/ui';
import style from './VideoMeta.module.css';

/**
 * Информация о видео.
 *
 * @param {Object} props
 * @param {Object} props.video
 * @param {string} props.mode
 */

export const VideoMeta = ({ video, mode }) => {
  const meta = getVideoMeta(video, mode);
  return (
    <div className={style.meta}>
      <h3 className={style.title}>{video.title}</h3>

      <EntityDetails items={meta.details} />

      <EntityDates {...meta.dates} />

      <EntityStats
        items={[
          {
            icon: '👁️',
            value: formatViews(video.viewCount),
          },
        ]}
      />
    </div>
  );
};
