import { useNavigate } from 'react-router-dom';
import { getPhotoActions } from '..';
import { formatTime } from '../../../shared/lib';
import {
  ActionChip,
  BaseCard,
  EntityActions,
  EntityContent,
  EntityHeader,
  EntityMeta,
  MediaPreview,
  Text,
} from '../../../shared/ui';

/**
 * Карточка фотографии (вкладка "Фото" в профиле).
 * @param {Object} props
 * @param {Object} props.photo - объект поста с типом image
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.onDelete - удалить
 * @param {Function} props.toggleComments - открыть/закрыть комментарии
 */
export const Photo = ({
  photo,
  targetUser,
  currentUser,
  onDelete,
  toggleLike,
  toggleComments,
}) => {
  const navigate = useNavigate();

  if (!photo?.id) return null;

  const isOwn = currentUser?.id === photo?.userId;

  const actions = getPhotoActions({
    photo,
    toggleLike,
    toggleComments,
    onShare: () => {
      sessionStorage.setItem('sharedPhotoId', photo?.id);
      navigate('/messages');
    },
  });

  return (
    <BaseCard
      header={
        <EntityHeader
          rightSlot={
            isOwn && (
              <ActionChip
                icon="🗑"
                onClick={() => onDelete?.(photo?.id)}
                aria-label="Удалить фото"
              />
            )
          }
        >
          <EntityMeta
            title="Фотография"
            subtitle={formatTime(photo?.createdAt)}
          />
        </EntityHeader>
      }
      content={
        <EntityContent>
          {photo?.mediaUrl && <MediaPreview src={photo?.mediaUrl} alt="Фото" />}

          {photo?.text && <Text linkifyText>{photo?.text}</Text>}
        </EntityContent>
      }
      actions={<EntityActions actions={actions} />}
    />
  );
};
