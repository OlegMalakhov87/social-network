import { useNavigate } from 'react-router-dom';
import {
  PhotoHeader,
  PhotoContent,
  PhotoActions,
} from '../../../entities/photo';
import { getPhotoActions } from '../../../shared/lib';
import { MediaCardLayout } from '../../../shared/ui';

/**
 * Карточка фотографии (вкладка "Фото" в профиле).
 * @param {Object} props
 * @param {Object} props.photo - объект поста с типом image
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.onDelete - удалить
 * @param {Function} props.toggleComments - открыть/закрыть комментарии
 */
export const PhotoCard = ({
  photo,
  currentUser,
  onDelete,
  toggleLike,
  toggleComments,
}) => {
  const navigate = useNavigate();

  if (!photo?.id) return null;

  const isOwn = currentUser?.id === photo.userId;

  const actions = getPhotoActions({
    photo,
    toggleLike,
    toggleComments,
    onShare: () => {
      sessionStorage.setItem('sharedPostId', photo.id);
      navigate('/messages');
    },
  });

  return (
    <MediaCardLayout
      header={<PhotoHeader photo={photo} isOwn={isOwn} onDelete={onDelete} />}
      content={<PhotoContent photo={photo} />}
      actions={<PhotoActions actions={actions} />}
    />
  );
};
