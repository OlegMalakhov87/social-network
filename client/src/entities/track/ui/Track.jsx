import { useState } from 'react';

import { getTrackActions, TrackMeta } from '..';
import { useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay } from '../../../shared/lib';
import {
  ActionChip,
  BaseCard,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  MediaPreview,
} from '../../../shared/ui';

/**
 * Отображает карточку трека.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.track - Трек.
 * @param {Array<Object>} props.allTracks - Треки очереди.
 * @param {Object} props.currentTrack - Текущий трек.
 * @param {boolean} props.isPlaying - Признак воспроизведения.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {boolean} props.isOwnProfile - Признак своего профиля.
 * @param {string} props.mode - Режим отображения.
 * @param {Function} props.onPlay - Обработчик воспроизведения.
 * @param {Function} props.togglePlay - Обработчик паузы.
 * @param {Function} props.addToLibrary - Обработчик добавления в библиотеку.
 * @param {Function} props.deleteFromLibrary - Обработчик удаления из библиотеки.
 * @param {Function} props.toggleFavorite - Обработчик избранного.
 * @param {Function} props.toggleLike - Обработчик лайка.
 * @param {Function} props.toggleComments - Обработчик комментариев.
 * @param {Function} props.updateTrack - Обработчик обновления.
 * @param {Function} props.onDelete - Обработчик удаления.
 * @returns {JSX.Element|null} Разметка карточки.
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
  deleteFromLibrary,
  toggleFavorite,
  toggleLike,
  toggleComments,
  updateTrack,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const notify = useNotify();

  if (!track?.id) return null;

  const isOwn = track.uploadedBy === currentUser?.id;

  const showFavorite = mode === 'profile' && isOwnProfile && track.isInLibrary;

  const disabledButton =
    mode === 'profile' && isOwnProfile && !track.isInLibrary;

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
    deleteFromLibrary,
    toggleLike,
    toggleComments,
    onUpdate: updateTrack,
    disabledButton,
  });

  const handleConfirmDelete = async () => {
    try {
      await onDelete?.(track?.id);
      setShowDeleteDialog(false);
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка удаления трека'));
    }
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
                    ariaLabel={
                      track.isFavorite
                        ? 'Убрать из избранного'
                        : 'Добавить в избранное'
                    }
                    onClick={() =>
                      toggleFavorite?.(
                        track.id,
                        track.libraryId,
                        track.isFavorite
                      )
                    }
                  />
                )
              }
              rightSlot={
                isOwn && (
                  <ActionChip
                    icon="🗑"
                    ariaLabel="Удалить трек"
                    onClick={() => setShowDeleteDialog(true)}
                  />
                )
              }
            ></EntityHeader>
          )
        }
        content={
          <EntityContent>
            <MediaPreview
              item={track}
              src={track.coverUrl}
              alt={track.title}
              currentItem={currentTrack}
              isPlaying={isPlaying}
              onClick={handlePlay}
              disabled={disabledButton}
              clickable={true}
              fallback={'/no-cover-640x360.png'}
              type="image"
            />
            <TrackMeta track={track} mode={mode} />
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
