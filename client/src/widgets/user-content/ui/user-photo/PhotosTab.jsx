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
import { CommentableGrid } from '../../../comment';

import styles from './PhotosTab.module.css';

/**
 * Отображает вкладку с сеткой фотографий.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.photos=[]] - Список фотографий
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {boolean} props.isOwnProfile - Признак собственного профиля
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.deletePhoto - Обработчик удаления фотографии
 * @param {Function} props.toggleComments - Обработчик открытия комментариев
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Function} props.onCommentChange - Обработчик изменения количества комментариев
 * @returns {JSX.Element} Разметка вкладки.
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

  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedPhoto,
    onSuccess: () => navigate('/messages'),
  });
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  // Показывает наложение, пока список обновляется при уже загруженных фотографиях.
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
        <div className={styles.content}>
          <CommentableGrid
            items={photos}
            commentTarget={commentTarget}
            onToggleComments={toggleComments}
            onCloseComments={onCloseComments}
            currentUser={currentUser}
            onCommentChange={onCommentChange}
            renderItem={({ item, onToggleComments }) => (
              <Photo
                photo={item}
                currentUser={currentUser}
                onShareEntity={shareEntity}
                toggleLike={toggleLike}
                onDelete={deletePhoto}
                toggleComments={onToggleComments}
              />
            )}
          />

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
