import { useNavigate } from 'react-router-dom';
import { Photo } from '../../../../entities/photo';
import { normalizeSharedPhoto } from '../../../../entities/shared-entity';
import { useShareEntity } from '../../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import { EntityWithComments } from '../../../entity-comments';
import styles from './PhotosTab.module.css';

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
 * @param {Object} props.commentTarget - целевой тип и id комментариев
 * @param {Function} props.onCloseComments - закрыть комментарии
 * @param {Function} props.onCommentChange - изменить количество комментариев
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
  commentTarget,
  onCloseComments,
  onCommentChange,
}) => {
  const navigate = useNavigate();

  /** Хук для работы с расшаренными сущностями в sessionStorage.*/
  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedPhoto,
    onSuccess: () => navigate('/messages'),
  });
  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && photos.length > 0;

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={isLoading && photos.length === 0}
        error={photos.length === 0 ? error : null}
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
        <div className={styles.photosGrid}>
          {photos.map((photo) => (
            <EntityWithComments
              key={photo.id}
              entity={photo}
              targetType="posts"
              isOpen={commentTarget?.id === photo.id}
              onClose={onCloseComments}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
              renderEntity={(entity) => (
                <Photo
                  photo={entity}
                  currentUser={currentUser}
                  onShareEntity={shareEntity}
                  toggleLike={toggleLike}
                  onDelete={deletePhoto}
                  toggleComments={toggleComments}
                />
              )}
            />
          ))}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {photos.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все фотографии"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
