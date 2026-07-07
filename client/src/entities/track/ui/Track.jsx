import { getTrackActions, TrackCover, TrackMeta } from '..';
import {
  ActionChip,
  BaseCard,
  EntityActions,
  EntityContent,
  EntityHeader,
} from '../../../shared/ui';

/**
 * Карточка одного трека.
 * @param {Object} props
 * @param {Object} props.track - объект трека
 * @param {Array} props.allTracks - все треки текущего контекста (для очереди)
 * @param {Object} props.currentTrack - текущий играющий трек
 * @param {boolean} props.isPlaying - проигрывается ли трек сейчас (true/false)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {string} props.mode
 * @param {Function} props.onPlay - начать воспроизведение
 * @param {Function} props.togglePlay - переключить play/pause текущего трека
 * @param {Function} props.addToLibrary - добавить в библиотеку
 * @param {Function} props.removeFromLibrary - удалить из библиотеки
 * @param {Function} props.toggleFavorite - добавит/удалить из избранного
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.toggleComments - открыть/закрыть комментарии
 * @param {Function} props.onDelete - удалить трек
 */

export const Track = ({
  track,
  allTracks,
  currentTrack,
  isPlaying,
  currentUser,
  isProfileOwner,
  mode,
  onPlay,
  togglePlay,
  addToLibrary,
  removeFromLibrary,
  toggleFavorite,
  toggleLike,
  toggleComments,
  onDelete,
}) => {
  if (!track?.id) return null;

  const isOwn = track.uploadedBy === currentUser?.id;

  const showFavorite =
    mode === 'profile' && isProfileOwner && track.isInLibrary;

  const handlePlay = () => {
    if (currentTrack?.id === track.id) {
      togglePlay?.();
    } else {
      onPlay?.(track, allTracks);
    }
  };

  const actions = getTrackActions({
    track,
    isOwn,
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
                icon={track.isFavorite ? '⭐' : '☆'}
                onClick={() => toggleFavorite?.(track.id)}
              />
            )
          }
          rightSlot={
            isOwn && (
              <ActionChip icon="🗑" onClick={() => onDelete?.(track.id)} />
            )
          }
        ></EntityHeader>
      }
      content={
        <EntityContent>
          <TrackCover
            track={track}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlay={handlePlay}
          />

          <TrackMeta track={track} />
        </EntityContent>
      }
      actions={<EntityActions actions={actions} />}
    />
  );
};
