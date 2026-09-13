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
 * @param {Function} props.deleteFromLibrary - функция для удаления трека из библиотеки
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

  /** Флаг владельца трека. */
  const isOwn = track.uploadedBy === currentUser?.id;

  /** Флаг отображения избранного. */
  const showFavorite = mode === 'profile' && isOwnProfile && track.isInLibrary;

  /** Флаг отключения кнопки. */
  const disabledButton =
    mode === 'profile' && isOwnProfile && !track.isInLibrary;

  /** Обработчик воспроизведения трека. */
  const handlePlay = () => {
    if (currentTrack?.id === track.id) {
      togglePlay?.();
    } else {
      onPlay?.(track, allTracks);
    }
  };

  /** Конфигурация элементов управления карточкой трека. */
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

  /** Обработчик подтверждения удаления трека. */
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
