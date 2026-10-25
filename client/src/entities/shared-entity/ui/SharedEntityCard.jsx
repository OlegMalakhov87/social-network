import { getStatsItems } from '..';
import {
  BaseCard,
  EntityContent,
  EntityMeta,
  EntityStats,
  Image,
  MediaPreview,
  Text,
} from '../../../shared/ui';
import { isPlayable } from '../../../shared/utils';

import style from './SharedEntityCard.module.css';

/**
 * Отображает карточку общей сущности в сообщении.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.entity - Общая сущность.
 * @param {Function} props.onPlayMedia - Обработчик воспроизведения.
 * @returns {JSX.Element|null} Разметка карточки.
 */
export const SharedEntityCard = ({ entity, onPlayMedia }) => {
  if (!entity) return null;

  const statsItems = getStatsItems(entity);

  const playable = isPlayable(entity);

  return (
    <BaseCard
      header={
        <EntityMeta
          avatar={entity.author?.avatarUrl}
          title={entity.author?.name}
        />
      }
      content={
        <EntityContent>
          {/* Отрисовывает медиа по типу сущности. */}
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
                  fallback="/image.jpg"
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
