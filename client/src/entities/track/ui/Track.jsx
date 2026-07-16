import { getTrackActions, TrackCover, TrackMeta } from '..';
import {
  ActionChip,
  BaseCard,
  EntityActions,
  EntityContent,
  EntityHeader,
  ConfirmDialog,
} from '../../../shared/ui';
import { useState } from 'react';
/**
 * Карточка одного трека.
 * @param {Object} props
 * @param {Object} props.track - объект трека
 * @param {Array} props.allTracks - все треки текущего контекста (для очереди)
 * @param {Object} props.currentTrack - текущий играющий трек
 * @param {boolean} props.isPlaying - проигрывается ли трек сейчас (true/false)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля
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
  isOwnProfile,
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  if (!track?.id) return null;

  const isOwn = track.uploadedBy === currentUser?.id;

  const showFavorite = mode === 'profile' && isOwnProfile && track.isInLibrary;

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

  const handleConfirmDelete = () => {
    onDelete?.(track?.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <BaseCard
        header={
          (showFavorite || isOwn) && (
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
                  <ActionChip
                    icon="🗑"
                    onClick={() => setShowDeleteDialog(true)}
                  />
                )
              }
            ></EntityHeader>
          )
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
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить трек?"
        description="Это действие нельзя отменить. Трек будет удален навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
