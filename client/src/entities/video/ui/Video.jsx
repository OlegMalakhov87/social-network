import { getVideoActions } from '..';
import {
  ActionChip,
  BaseCard,
  EntityActions,
  EntityContent,
  EntityHeader,
} from '../../../shared/ui';
import { VideoMeta, VideoThumbnail } from './VideoThumbnail';

/**
 * Карточка одного видео.
 * @param {Object} props
 * @param {Object} props.video - объект видео
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {boolean} props.isPlaying - проигрывается видео true/false
 * @param {Object} props.currentVideo - текущее видео
 * @param {string} props.mode
 * @param {Function} props.onPlay - клик по видео (воспроизвести)
 * @param {Function} props.onDelete - удалить видео
 * @param {Function} props.addToLibrary - добавить в библиотеку
 * @param {Function} props.removeFromLibrary - удалить из библиотеки
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.toggleFavorite - добавит/удалить из избранного
 * @param {Function} props.toggleComments - открыть комментарии
 */

export const Video = ({
  video,
  currentUser,
  isProfileOwner,
  currentVideo,
  isPlaying,
  mode,
  onPlay,
  onDelete,
  addToLibrary,
  removeFromLibrary,
  toggleLike,
  toggleFavorite,
  toggleComments,
}) => {
  if (!video?.id) return null;

  const isOwn = video.uploadedBy === currentUser?.id;

  const showFavorite =
    mode === 'profile' && isProfileOwner && video.isInLibrary;

  const actions = getVideoActions({
    video,
    addToLibrary,
    removeFromLibrary,
    toggleLike,
    toggleComments,
  });

  return (
    <BaseCard
      header={
        <EntityHeader
          leftSlot={
            showFavorite && (
              <ActionChip
                icon={video.isFavorite ? '⭐' : '☆'}
                onClick={() => toggleFavorite?.(video.id)}
              />
            )
          }
          rightSlot={
            isOwn && (
              <ActionChip icon="🗑" onClick={() => onDelete?.(video.id)} />
            )
          }
        ></EntityHeader>
      }
      content={
        <EntityContent>
          <VideoThumbnail
            video={video}
            currentVideo={currentVideo}
            isPlaying={isPlaying}
            onPlay={onPlay}
          />
          <VideoMeta video={video} mode={mode} />
        </EntityContent>
      }
      actions={<EntityActions actions={actions} />}
    />
  );
};
