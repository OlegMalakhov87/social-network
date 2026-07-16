import { useEffect } from 'react';
import { Video } from '../../../../../entities/video';
import { ContentState, ErrorBanner, InfiniteScrollFooter } from '../../../../../shared/ui';
import style from './VideosTab.module.css';

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
 * @param {Function} props.toggleLikes - лайк/дизлайк
 * @param {Function} props.addOptimistic - добавить видео в библиотеку 
 * @param {Function} props.removeOptimistic - удалить видео из библиотеки 
 * @param {Function} props.updateViewCount - обновить счетчик просмотров
 * @param {Function} props.updateGlobalViewCount - обновить глобальный счетчик просмотров
 * @param {Function} props.onPlayVideo - воспроизведение видео
 * @param {Function} props.deleteOptimistic - удалить  видео
 * @param {Function} props.toggleFavorite - удалить/добавить в избранное
 * @param {Function} props.toggleComments - открыть комментарии/закрыть комментарии для видео.
 * @param {Function} props.onRetry - повторить загрузку
 * @param {boolean} props.hasMore - флаг наличия следующей страницы видео
 * @param {Function} props.loadMore - функция для загрузки следующей страницы видео
 */
export const VideosTab = ({
  videos = [],
  currentUser,
  isOwnProfile,
  isLoading,
  isLoadingMore,
  error,
  mode,
  toggleLikes,
  addOptimistic,
  removeOptimistic,
  updateViewCount,
  updateGlobalViewCount,
  onPlayVideo,
  deleteOptimistic,
  toggleFavorite,
  toggleComments,
  onRetry,
  loadMore,
  hasMore,
}) => {
  /** Обработчик для увеличения счетчика просмотров при воспроизведении видео */
  useEffect(() => {
    if (typeof onPlayVideo !== 'function') return;

    onPlayVideo((video) => {
      const currentVideo = videos.find((item) => item.id === video?.id);
      const profileLibraryId =
        currentVideo?.profileLibraryId || video.profileLibraryId;

      const viewCount = currentVideo?.viewCount ?? video?.viewCount;
      const newViewCount = (viewCount ?? 0) + 1;

      if (profileLibraryId) {
        updateViewCount?.(
          video?.id ?? 0,
          profileLibraryId,
          currentVideo?.isFavorite ?? video?.isFavorite,
          newViewCount ?? 0
        );
      } else {
        updateGlobalViewCount?.(video?.id ?? 0);
      }
    });
    return () => onPlayVideo(null);
  }, [onPlayVideo, updateViewCount, updateGlobalViewCount, videos]);


  return (
    <ContentState
      loading={isLoading && videos.length === 0}
      isEmpty={!videos?.length}
      error={error}
      loadingMessage="Загружаем видео..."
      emptyIcon="🎬"
      emptyTitle="Нет видео"
      emptyDescription={
        isOwnProfile
          ? 'Добавьте свои первые видео.'
          : 'У пользователя пока нет публичных видео.'
      }
      onRetry={onRetry}
    >
      <div className={style.videosGrid}>
        {videos.map((item) => {
          return (
            <Video
              video={item}
              currentUser={currentUser}
              isOwnProfile={isOwnProfile}
              mode={mode}
              onPlay={onPlayVideo}
              addToLibrary={addOptimistic}
              removeFromLibrary={removeOptimistic}
              toggleLike={toggleLikes}
              onDelete={deleteOptimistic}
              toggleComments={toggleComments}
              updateViewCount={updateViewCount}
              updateGlobalViewCount={updateGlobalViewCount}
              toggleFavorite={toggleFavorite}
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
