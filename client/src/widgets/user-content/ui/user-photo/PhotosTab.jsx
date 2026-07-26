import { Photo } from '../../../../../entities/photo';
import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../../../shared/ui';
import style from './PhotosTab.module.css';

/**
 * Вкладка с сеткой фото (посты у которых тип image).
 * @param {Object} props
 * @param {Array} props.photos - массив фото (посты у которых тип image)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля(да или нет)
 * @param {boolean} props.isLoading - флаг общей загрузки фото
 * @param {string|null} props.error - ошибка
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.deletePhoto - удалить фото
 * @param {Function} props.toggleComments - открыть комментарии
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей страницы фото
 * @param {boolean} props.hasMore - флаг наличия следующей страницы фото
 * @param {Function} props.onRetry - повторить загрузку
 * @param {Function} props.loadMore - функция для загрузки следующей страницы фото
 */

export const PhotosTab = ({
  photos = [],
  currentUser,
  isOwnProfile,
  isLoading,
  isLoadingMore,
  error,
  toggleLike,
  deletePhoto,
  toggleComments,
  onRetry,
  loadMore,
  hasMore,
}) => {
  return (
    <ContentState
      loading={isLoading && photos.length === 0}
      error={error && photos.length === 0}
      isEmpty={!photos?.length}
      loadingMessage="Загружаем фотографии..."
      emptyIcon="📷"
      emptyTitle="Нет фотографий"
      emptyDescription={
        isOwnProfile
          ? 'Опубликуйте свои первые фотографии.'
          : 'У пользователя пока нет публичных фото.'
      }
      onRetry={onRetry}
    >
      <div className={style.photosGrid}>
        {photos.map((item) => {
          return (
            <Photo
              photo={item}
              currentUser={currentUser}
              toggleLike={toggleLike}
              onDelete={deletePhoto}
              toggleComments={toggleComments}
            />
          );
        })}

        {photos.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели все фотографии"
          />
        )}

        {error && photos.length > 0 && (
          <ErrorBanner
            message="Не удалось загрузить следующую порцию фотографий"
            onRetry={loadMore}
          />
        )}
      </div>
    </ContentState>
  );
};
