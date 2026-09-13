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
 * @param {Function} props.deleteFromLibrary - функция для удаления видео из библиотеки
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

  /** Флаг владельца видео. */
  const isOwn = video.uploadedBy === currentUser?.id;

  /** Флаг отображения избранного. */
  const showFavorite = mode === 'profile' && isOwnProfile && video.isInLibrary;

  /** Флаг отключения кнопки. */
  const disabledButton =
    mode === 'profile' && isOwnProfile && !video.isInLibrary;

  /** Конфигурация элементов управления карточкой видео. */
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

  /** Обработчик подтверждения удаления видео. */
  const handleConfirmDelete = async () => {
    try {
      await deleteVideo?.(video?.id);
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
