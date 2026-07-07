import { Photo } from '../../../../../entities/photo';
import { ContentState } from '../../../../../shared/ui';
import style from './PhotosTab.module.css';

/**
 * Вкладка с сеткой фото (посты у которых тип image).
 * @param {Object} props
 * @param {Array} props.photos - массив фото (посты у которых тип image)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля(да или нет)
 * @param {boolean} props.isLoading - загружены фото или нет
 * @param {string|null} props.error - ошибка
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.deletePhoto - удалить фото
 * @param {Function} props.toggleComments - открыть комментарии
 * @param {Function} props.onRetry - повторить загрузку
 */

export const PhotosTab = ({
  photos = [],
  currentUser,
  targetUser,
  isProfileOwner,
  isLoading,
  error,
  toggleLike,
  deletePhoto,
  toggleComments,
  onRetry,
}) => {
  return (
    <ContentState
      loading={isLoading || (!currentUser && !targetUser)}
      error={error}
      isEmpty={!photos?.length}
      loadingMessage="Загружаем фотографии..."
      emptyIcon="📷"
      emptyTitle="Нет фотографий"
      emptyDescription={
        isProfileOwner
          ? 'Опубликуйте свои первые фотографии.'
          : 'У пользователя пока нет публичных фото.'
      }
      onRetry={onRetry}
    >
      <div className={style.photosGrid}>
        {photos.map((photo) => (
          <Photo
            key={photo.id}
            photo={photo}
            targetUser={targetUser}
            currentUser={currentUser}
            toggleLike={toggleLike}
            onDelete={deletePhoto}
            toggleComments={toggleComments}
          />
        ))}
      </div>
    </ContentState>
  );
};
