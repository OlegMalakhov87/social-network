import { useEffect, useRef } from 'react';

import { Video } from '../../../../entities/video';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import { EntityWithComments } from '../../../comment';

import styles from './VideosTab.module.css';

/**
 * Отображает вкладку с сеткой видео.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.videos=[]] - Список видео
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {boolean} props.isOwnProfile - Признак собственного профиля
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {string} props.mode - Режим отображения
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.addToLibrary - Обработчик добавления видео в библиотеку
 * @param {Function} props.deleteFromLibrary - Обработчик удаления видео из библиотеки
 * @param {Function} [props.updateLibraryViewsCount] - Обработчик счётчика просмотров в библиотеке
 * @param {Function} [props.updateGlobalViewsCount] - Обработчик общего счётчика просмотров
 * @param {Function} props.onPlayVideo - Обработчик открытия видео
 * @param {Function} [props.onVideoStart] - Обработчик старта воспроизведения
 * @param {Object} props.currentVideo - Текущее видео
 * @param {boolean} props.isPlaying - Признак воспроизведения текущего видео
 * @param {Function} props.toggleFavorite - Обработчик переключения избранного
 * @param {Function} props.toggleComments - Обработчик открытия и закрытия комментариев
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Function} props.onCommentChange - Обработчик изменения комментариев
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.updateVideo - Обработчик обновления видео
 * @param {Function} props.deleteVideo - Обработчик удаления видео
 * @returns {JSX.Element} Разметка вкладки.
 */
export const VideosTab = ({
  videos = [],
  currentUser,
  toggleComments,
  commentTarget,
  onCloseComments,
  onCommentChange,
  isOwnProfile,
  toggleLike,
  isLoading,
  isLoadingMore,
  error,
  mode,
  onPlayVideo,
  onVideoStart,
  currentVideo,
  isPlaying,
  addToLibrary,
  deleteFromLibrary,
  updateLibraryViewsCount,
  toggleFavorite,
  hasMore,
  loadMore,
  onRetry,
  updateGlobalViewsCount,
  updateVideo,
  deleteVideo,
}) => {
  const videosRef = useRef(videos);
  // Оставляет в эффекте актуальный список без повторной подписки на каждый ответ.
  videosRef.current = videos;

  // Показывает наложение, пока список обновляется при уже загруженных видео.
  const isRefetching = isLoading && videos.length > 0;

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    if (typeof onVideoStart !== 'function') return;

    /**
     * Увеличивает счётчик просмотров запущенного видео.
     *
     * @param {Object} video - Запущенное видео
     */
    onVideoStart((video) => {
      if (!video?.id) return;

      const currentVideo = videosRef.current.find(
        (item) => item.id === video.id
      );

      const profileLibraryId =
        currentVideo?.profileLibraryId ?? currentVideo?.libraryId;
      if (mode === 'profile' && profileLibraryId) {
        updateLibraryViewsCount?.(currentVideo?.id, profileLibraryId);
      } else {
        updateGlobalViewsCount?.(currentVideo?.id);
      }
    });

    return () => onVideoStart(null);
  }, [
    onVideoStart,
    updateLibraryViewsCount,
    updateGlobalViewsCount,
    mode,
    isOwnProfile,
  ]);

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={isLoading && videos.length === 0}
        isEmpty={!videos?.length}
        error={videos.length === 0 ? error : null}
        loadingMessage="Загружаем видео..."
        emptyIcon="🎬"
        emptyTitle="Нет видео"
        emptyDescription={
          mode === 'profile'
            ? isOwnProfile
              ? 'Добавьте свои первые видео.'
              : 'У пользователя пока нет публичных видео.'
            : 'Попробуйте изменить категорию или поисковый запрос.'
        }
        onRetry={onRetry}
      >
        <div className={styles.videosList}>
          {videos.map((video) => (
            <EntityWithComments
              key={video.id}
              entity={video}
              targetType="videos"
              isOpen={commentTarget?.id === video.id}
              onClose={onCloseComments}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
              renderEntity={(entity) => (
                <Video
                  video={entity}
                  currentUser={currentUser}
                  isOwnProfile={isOwnProfile}
                  mode={mode}
                  onPlay={onPlayVideo}
                  currentVideo={currentVideo}
                  isPlaying={isPlaying}
                  addToLibrary={addToLibrary}
                  deleteFromLibrary={deleteFromLibrary}
                  toggleLike={toggleLike}
                  toggleFavorite={toggleFavorite}
                  toggleComments={toggleComments}
                  updateVideo={updateVideo}
                  deleteVideo={deleteVideo}
                />
              )}
            />
          ))}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {videos.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все видео"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
