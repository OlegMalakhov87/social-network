import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotoActions } from '..';
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
import { normalizeSharedPhoto } from '../../shared-entity';
import styles from './Photo.module.css';
/**
 * Компонент для отображения карточки фотографии.
 * @param {Object} props - пропсы компонента
 * @param {Object} props.photo - данные фотографии
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleLike - функция для лайка/дизлайка фотографии
 * @param {Function} props.onDelete - функция для удаления фотографии
 * @param {Function} props.toggleComments - функция для открытия/закрытия комментариев к фотографии
 */
export const Photo = ({
  photo,
  currentUser,
  onDelete,
  toggleLike,
  toggleComments,
}) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  if (!photo?.id) return null;

  const isOwn = currentUser?.id === photo?.userId;

  const actions = getPhotoActions({
    photo,
    toggleLike,
    toggleComments,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => {
      sessionStorage.setItem(
        'sharedEntity',
        JSON.stringify(normalizeSharedPhoto(photo))
      );
      navigate('/messages');
    },
  });

  const handleConfirmDelete = () => {
    onDelete?.(photo?.id);
    setShowDeleteDialog(false);
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
                  aria-label="Удалить фото"
                />
              )
            }
          >
            <EntityMeta subtitle={formatDate(photo.createdAt)} />
          </EntityHeader>
        }
        content={
          <EntityContent>
            {photo?.postUrl && (
              <MediaPreview
                src={photo?.postUrl}
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
