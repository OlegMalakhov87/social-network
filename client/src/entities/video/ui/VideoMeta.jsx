import { getVideoMeta } from '..';
import { EntityDates, EntityInfoList, EntityStats } from '../../../shared/ui';
import { formatViews } from '../../../shared/utils';
import styles from './VideoMeta.module.css';

/**
 * Информация о видео.
 *
 * @param {Object} props
 * @param {Object} props.video - данные видео
 * @param {string} [props.mode] - режим отображения
 */
export const VideoMeta = ({ video, mode }) => {
  const meta = getVideoMeta(video, mode);

  return (
    <div className={styles.meta}>
      <h3 className={styles.title}>{video.title}</h3>

      <EntityInfoList items={meta.details} className={styles.details} />

      <EntityDates {...meta.dates} />

      <EntityStats
        items={[
          {
            icon: '👁️',
            value: formatViews(video.viewsCount),
          },
        ]}
      />
    </div>
  );
};
