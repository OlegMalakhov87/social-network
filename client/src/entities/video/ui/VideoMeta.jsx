import { getVideoMeta } from '..';
import { EntityDates, EntityInfoList, EntityStats } from '../../../shared/ui';
import { formatViews } from '../../../shared/utils';

import styles from './VideoMeta.module.css';

/**
 * Отображает сведения о видео.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.video - Видео.
 * @param {string} [props.mode] - Режим отображения.
 * @returns {JSX.Element} Разметка сведений.
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
