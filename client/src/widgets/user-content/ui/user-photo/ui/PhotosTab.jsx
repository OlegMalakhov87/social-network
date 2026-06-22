import style from './PhotosTab.module.css';
import { PhotoCard } from '../../../../../entities/photo';
import { EmptyState, Loading } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой фото (посты у которых тип image).
 * @param {Object} props
 * @param {Array} props.items - массив фото (посты у которых тип image)
 * @param {Object} props.pagination - данные пагинации
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Function} props.toggleLikePhoto - лайк/дизлайк
 * @param {Function} props.onDeletePhoto - удалить фото
 * @param {Function} props.onToggleComments - открыть комментарии
 * @param {boolean} props.isLoadingPhoto - загружены фото или нет
 */

export const PhotosTab = ({
  items,
  pagination,
  currentUser,
  toggleLikePhoto,
  onDeletePhoto,
  onToggleComments,
  isLoadingPhoto,
}) => {
  // Состояние загрузки вкладки с фото
  if (isLoadingPhoto) {
    return <Loading fullPage message="Загружаем фото..." size="large" />;
  }

  if (!items?.length) {
    return (
      <div className={style.emptyWrapper}>
        <EmptyState
          icon="📷"
          title="Нет фото"
          description={
            currentUser?.id === items?.[0]?.userId
              ? 'Загрузите первые фотографии!'
              : 'У пользователя пока нет публичных фото'
          }
        />
      </div>
    );
  }

  return (
    <div className={style.photosGrid}>
      {items.map((photo) => {
        const isOwn = photo.userId === currentUser?.id;
        return (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isOwn={isOwn}
            toggleLike={toggleLikePhoto}
            onDelete={onDeletePhoto}
            toggleComments={onToggleComments}
          />
        );
      })}
    </div>
  );
};
