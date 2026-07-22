import { useState } from 'react';
import { getTrackActions, TrackCover, TrackMeta } from '..';
import {
  ActionChip,
  BaseCard,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
} from '../../../shared/ui';
/**
 * Карточка одного трека.
 * @param {Object} props - пропсы компонента
 * @param {Object} props.track - объект трека
 * @param {Array} props.allTracks - все треки текущего контекста (для очереди)
 * @param {Object} props.currentTrack - текущий играющий трек
 * @param {boolean} props.isPlaying - проигрывается ли трек сейчас (true/false)
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {boolean} props.isOwnProfile - владелец профиля
 * @param {string} props.mode - режим отображения
 * @param {Function} props.onPlay - функция для начать воспроизведение
 * @param {Function} props.togglePlay - функция для переключения play/pause текущего трека
 * @param {Function} props.addToLibrary - функция для добавления трека в библиотеку
 * @param {Function} props.removeFromLibrary - функция для удаления трека из библиотеки
 * @param {Function} props.toggleFavorite - функция для добавления/удаления трека из избранного
 * @param {Function} props.toggleLike - функция для лайка/дизлайка трека
 * @param {Function} props.toggleComments - функция для открытия/закрытия комментариев к треку
 * @param {Function} props.updateTrack - функция для обновления трека
 * @param {Function} props.onDelete - функция для удаления трека
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
  updateTrack,
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
    onUpdate: updateTrack,
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
