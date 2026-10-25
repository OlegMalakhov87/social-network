import { useState } from 'react';

import { getVideoActions, VideoMeta } from '..';
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
 * Отображает карточку видео.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.video - Видео.
 * @param {Object} props.currentUser - Текущий пользователь.
 * @param {boolean} props.isOwnProfile - Признак своего профиля.
 * @param {Object} props.currentVideo - Текущее видео.
 * @param {boolean} props.isPlaying - Признак воспроизведения.
 * @param {string} props.mode - Режим отображения.
 * @param {Function} props.onPlay - Обработчик воспроизведения.
 * @param {Function} props.addToLibrary - Обработчик добавления в библиотеку.
 * @param {Function} props.deleteFromLibrary - Обработчик удаления из библиотеки.
 * @param {Function} props.toggleLike - Обработчик лайка.
 * @param {Function} props.toggleFavorite - Обработчик избранного.
 * @param {Function} props.toggleComments - Обработчик комментариев.
 * @param {Function} props.updateVideo - Обработчик обновления.
 * @param {Function} props.deleteVideo - Обработчик удаления.
 * @returns {JSX.Element|null} Разметка карточки.
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
  deleteFromLibrary,
  toggleLike,
  toggleFavorite,
  toggleComments,
  updateVideo,
  deleteVideo,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const notify = useNotify();

  if (!video?.id) return null;

  const isOwn = video.uploadedBy === currentUser?.id;

  const showFavorite = mode === 'profile' && isOwnProfile && video.isInLibrary;

  const disabledButton =
    mode === 'profile' && isOwnProfile && !video.isInLibrary;

  const actions = getVideoActions({
    video,
    isOwn,
    addToLibrary,
    deleteFromLibrary,
    toggleLike,
    toggleComments,
    onUpdate: updateVideo,
    disabledButton,
  });

  const handleConfirmDelete = async () => {
    try {
      await deleteVideo?.(video.id);
      setShowDeleteDialog(false);
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка удаления видео'));
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
                    icon={video.isFavorite ? '⭐' : '☆'}
                    onClick={() =>
                      toggleFavorite?.(
                        video.id,
                        video.libraryId,
                        video.isFavorite
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
              item={video}
              src={video.thumbnailUrl}
              preview={video.previewUrl}
              alt={video.title}
              currentItem={currentVideo}
              isPlaying={isPlaying}
              onClick={onPlay}
              disabled={disabledButton}
              clickable={true}
              fallback={'/no-thumbnail-1200x720.png'}
              type="video"
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
