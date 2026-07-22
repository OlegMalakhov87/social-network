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
 * @param {Object} props - пропсы компонента
 * @param {Object} props.video - данные видео
 * @param {Object} props.currentUser - данные текущего пользователя
 * @param {boolean} props.isOwnProfile - флаг владельца профиля
 * @param {boolean} props.isPlaying - флаг проигрывается видео true/false
 * @param {Object} props.currentVideo - данные текущего видео
 * @param {string} props.mode - режим отображения
 * @param {Function} props.onPlay - функция для воспроизведения видео
 * @param {Function} props.toggleLike - функция для лайка/дизлайка видео
 * @param {Function} props.toggleFavorite - функция для добавления/удаления из избранного
 * @param {Function} props.toggleComments - функция для открытия/закрытия комментариев к видео
 * @param {Function} props.updateVideo - функция для обновления видео
 * @param {Function} props.deleteVideo - функция для удаления видео
 * @param {Function} props.addToLibrary - функция для добавления видео в библиотеку
 * @param {Function} props.removeFromLibrary - функция для удаления видео из библиотеки
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
