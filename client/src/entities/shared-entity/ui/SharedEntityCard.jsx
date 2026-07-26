import { getStatsItems, isPlayable } from '..';
import {
  BaseCard,
  EntityContent,
  EntityMeta,
  EntityStats,
  Image,
  MediaPreview,
  Text,
} from '../../../shared/ui';
import style from './SharedEntityCard.module.css';

/**
 * Универсальная карточка расшаренной сущности в сообщении.
 * Поддерживает типы: 'post', 'video', 'track', 'article'.
 *
 * @param {Object} props
 * @param {Object} props.entity - данные сущности (приведенные к единому формату)
 * @param {Function} props.onPlayMedia - колбэк для воспроизведения медиа (видео/аудио)
 */
export const SharedEntityCard = ({ entity, onPlayMedia }) => {
  if (!entity) return null;

  /** Получаем маппинг статистики для сущности. */
  const statsItems = getStatsItems(entity);

  /** Определяем, является ли сущность воспроизводимой (видео/аудио). */
  const playable = isPlayable(entity);

  return (
    <BaseCard
      header={
        <EntityMeta
          avatar={entity.author?.photoUrl}
          title={entity.author?.name || entity.author}
        />
      }
      content={
        <EntityContent>
          {/* Рендер медиа в зависимости от типа */}
          {entity.mediaUrl && (
            <div className={style.mediaWrapper}>
              {playable ? (
                <MediaPreview
                  src={entity.mediaUrl}
                  alt={entity.title || 'Медиа'}
                  clickable={true}
                  onClick={() => onPlayMedia?.(entity)}
                />
              ) : (
                <Image
                  src={entity.mediaUrl}
                  alt={entity.title || 'Изображение'}
                  fallback="/error-page.png"
                  className={style.image}
                />
              )}
            </div>
          )}

          {entity.text && <Text linkifyText={true}>{entity.text}</Text>}
        </EntityContent>
      }
      footer={<EntityStats items={statsItems} />}
    />
  );
};
