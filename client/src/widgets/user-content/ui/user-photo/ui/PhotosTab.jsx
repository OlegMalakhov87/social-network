import style from './PhotosTab.module.css';
import { PhotoCard } from '../../../../../entities/photo';
import { ContentState } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой фото (посты у которых тип image).
 * @param {Object} props
 * @param {Array} props.photos - массив фото (посты у которых тип image)
 * @param {boolean} props.isProfileOwner - владелец профиля(да или нет)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleLikePhoto - лайк/дизлайк
 * @param {Function} props.onDeletePhoto - удалить фото
 * @param {Function} props.onToggleComments - открыть комментарии
 * @param {boolean} props.isLoadingPhoto - загружены фото или нет
 * @param {string|null} props.errorPhoto - ошибка
 * @param {Function} props.onRetry - повторить загрузку
 */

export const PhotosTab = ({
  photos,
  isProfileOwner,
  currentUser,
  toggleLikePhoto,
  onDeletePhoto,
  onToggleComments,
  isLoadingPhoto,
  errorPhoto,
  onRetry,
}) => {
  return (
    <ContentState
      loading={isLoadingPhoto}
      error={errorPhoto}
      isEmpty={!photos?.length}
      loadingMessage="Загружаем фотографии..."
      emptyIcon="📝"
      emptyTitle="Нет фотографий"
      emptyDescription={
        isProfileOwner
          ? 'Опубликуйте свои первые фотографии.'
          : 'Пользователь пока ничего не публиковал.'
      }
      onRetry={onRetry}
    >
      <div className={style.photosGrid}>
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            currentUser={currentUser}
            toggleLike={toggleLikePhoto}
            onDelete={onDeletePhoto}
            toggleComments={onToggleComments}
          />
        ))}
      </div>
    </ContentState>
  );
};
