import { useState } from 'react';
import { getPhotoActions } from '..';
import { useNotify } from '../../../shared/hooks';
import { getApiErrorDisplay } from '../../../shared/lib';
import {
  ActionChip,
  BaseCard,
  ConfirmDialog,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
} from '../../../shared/ui';
import { formatDate } from '../../../shared/utils';
import styles from './Photo.module.css';
/**
 * Компонент для отображения карточки фотографии.
 * @param {Object} props - пропсы компонента
 * @param {Object} props.photo - данные фотографии
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.onShareEntity - функция для отображения сообщения о успешном сохранении фотографии
 * @param {Function} props.toggleLike - функция для лайка/дизлайка фотографии
 * @param {Function} props.onDelete - функция для удаления фотографии
 * @param {Function} props.toggleComments - функция для открытия/закрытия комментариев к фотографии
 */
export const Photo = ({
  photo,
  currentUser,
  onShareEntity,
  onDelete,
  toggleLike,
  toggleComments,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const notify = useNotify();

  if (!photo?.id) return null;

  const isOwn = currentUser?.id === photo?.userId;

  const actions = getPhotoActions({
    photo,
    toggleLike,
    toggleComments,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => onShareEntity(photo),
  });

  const handleConfirmDelete = async () => {
    try {
      await onDelete?.(photo.id);
      setShowDeleteDialog(false);
    } catch (error) {
      notify.error(getApiErrorDisplay(error, 'Ошибка удаления фото'));
    }
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader
            rightSlot={
              isOwn && (
                <ActionChip
                  icon="🗑"
                  onClick={() => setShowDeleteDialog(true)}
                  ariaLabel="Удалить фото"
                />
              )
            }
          >
            <EntityMeta subtitle={formatDate(photo.createdAt)} />
          </EntityHeader>
        }
        content={
          <EntityContent>
            {photo.postUrl && (
              <MediaPreview
                src={photo.postUrl}
                alt="Фото"
                className={styles.media}
              />
            )}
          </EntityContent>
        }
        actions={<EntityActions actions={actions} />}
      />
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить фото?"
        description="Это действие нельзя отменить. Фото будет удалено навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
