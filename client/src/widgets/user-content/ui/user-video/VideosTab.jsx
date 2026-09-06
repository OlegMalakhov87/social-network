import { useEffect, useRef } from 'react';
import { Video } from '../../../../entities/video';
import {
  ContentState,
  ErrorBanner,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import styles from './VideosTab.module.css';

/**
 * Вкладка с сеткой видео.
 * @param {Object} props
 * @param {Array} props.videos - массив видео
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля
 * @param {boolean} props.isLoading - флаг общей загрузки видео
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей страницы видео
 * @param {string} props.error - ошибка
 * @param {string} props.mode - режим отображения
 * @param {Function} props.toggleLike - лайк/дизлайк
 * @param {Function} props.addToLibrary - добавить видео в библиотеку
 * @param {Function} props.deleteFromLibrary - удалить видео из библиотеки
 * @param {Function} props.updateLibraryViewsCount - обновить счетчик просмотров (профиль / библиотека)
 * @param {Function} props.updateGlobalViewsCount - глобальный счётчик просмотров
 * @param {Function} props.onPlayVideo - открыть видеоплеер (передаётся объект video)
 * @param {Function} [props.onVideoStart] - регистрация колбэка при старте воспроизведения (как setOnTrackStart)
 * @param {Object} props.currentVideo - текущее видео
 * @param {boolean} props.isPlaying - флаг воспроизведения текущего видео
 * @param {Function} props.toggleFavorite - удалить/добавить в избранное
 * @param {Function} props.toggleComments - открыть комментарии/закрыть комментарии для видео.
 * @param {Function} props.onRetry - повторить загрузку
 * @param {boolean} props.hasMore - флаг наличия следующей страницы видео
 * @param {Function} props.loadMore - функция для загрузки следующей страницы видео
 * @param {Function} props.updateVideo - обновить видео
 * @param {Function} props.deleteVideo - удалить видео
 */
export const VideosTab = ({
  videos = [],
  currentUser,
  toggleComments,
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
  videosRef.current = videos;

  /** Счётчик просмотров при старте воспроизведения в модальном плеере (профиль) */
  useEffect(() => {
    if (typeof onVideoStart !== 'function') return;

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
        {videos.map((video) => {
          return (
            <Video
              key={video.id}
              video={video}
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
          );
        })}

        {videos.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={error}
            onRetry={loadMore}
            endMessage="Вы просмотрели все видео"
          />
        )}

        {error && videos.length > 0 && (
          <ErrorBanner
            message="Не удалось загрузить следующую порцию видео"
            onRetry={loadMore}
          />
        )}
      </div>
    </ContentState>
  );
};
