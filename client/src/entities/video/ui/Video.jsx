import { useState } from 'react';
import { getVideoActions, VideoMeta, VideoThumbnail } from '..';
import {
  ActionChip,
  BaseCard,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
} from '../../../shared/ui';

/**
 * Карточка одного видео.
 * @param {Object} props
 * @param {Object} props.video - объект видео
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля
 * @param {boolean} props.isPlaying - проигрывается видео true/false
 * @param {Object} props.currentVideo - текущее видео
 * @param {string} props.mode
 * @param {Function} props.onPlay - клик по видео (воспроизвести)
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.toggleFavorite - добавит/удалить из избранного
 * @param {Function} props.toggleComments - открыть комментарии
 * @param {Function} props.updateVideo - обновить видео
 * @param {Function} props.deleteVideo - удалить видео
 * @param {Function} props.addToLibrary - добавить в библиотеку
 * @param {Function} props.removeFromLibrary - удалить из библиотеки
 */

export const Video = ({
  video,
  currentUser,
  isOwnProfile,
  currentVideo,
  isPlaying,
  mode,
  onPlay,
  addToLibrary,
  removeFromLibrary,
  toggleLike,
  toggleFavorite,
  toggleComments,
  updateVideo,
  deleteVideo,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  if (!video?.id) return null;

  const isOwn = video.uploadedBy === currentUser?.id;

  const showFavorite = mode === 'profile' && isOwnProfile && video.isInLibrary;

  const actions = getVideoActions({
    video,
    isOwn,
    addToLibrary,
    removeFromLibrary,
    toggleLike,
    toggleComments,
    onUpdate: updateVideo,
  });

  const handleConfirmDelete = () => {
    deleteVideo?.(video?.id);
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
                    icon={video.isFavorite ? '⭐' : '☆'}
                    onClick={() => toggleFavorite?.(video.id)}
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

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить видео?"
        description="Это действие нельзя отменить. Видео будет удалено навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
