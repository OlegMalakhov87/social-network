import { useEffect } from 'react';
import { Video } from '../../../../../entities/video';
import { ContentState } from '../../../../../shared/ui';
import style from './VideosTab.module.css';

/**
 * Вкладка с сеткой видео.
 * @param {Object} props
 * @param {Array} props.videos - массив видео
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {boolean} props.isLoading - загружено видео или нет
 * @param {string} props.error - ошибка
 * @param {string} props.mode - режим отображения
 * @param {Function} props.toggleLikes - лайк/дизлайк
 * @param {Function} props.addOptimistic - добавить оптимистический в библиотеку для видео
 * @param {Function} props.removeOptimistic - удалить оптимистический из библиотеки для видео
 * @param {Function} props.updateViewCount - обновить счетчик просмотров
 * @param {Function} props.updateGlobalViewCount - обновить глобальный счетчик просмотров
 * @param {Function} props.onPlayVideo - воспроизведение видео
 * @param {Function} props.deleteVideo - удалить видео
 * @param {Function} props.toggleFavorite - удалить/добавить в избранное
 * @param {Function} props.toggleComments - открыть комментарии/закрыть комментарии для видео.
 * @param {Function} props.onRetry - повторить загрузку
 */
export const VideosTab = ({
  videos = [],
  currentUser,
  targetUser,
  isProfileOwner,
  isLoading,
  error,
  mode,
  toggleLikes,
  addOptimistic,
  removeOptimistic,
  updateViewCount,
  updateGlobalViewCount,
  onPlayVideo,
  deleteVideo,
  toggleFavorite,
  toggleComments,
  onRetry,
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
      loading={isLoading || (!currentUser && !targetUser)}
      isEmpty={!videos?.length}
      error={error}
      loadingMessage="Загружаем видео..."
      emptyIcon="🎬"
      emptyTitle="Нет видео"
      emptyDescription={
        isProfileOwner
          ? 'Добавьте свои первые видео.'
          : 'У пользователя пока нет публичных видео.'
      }
      onRetry={onRetry}
    >
      <div className={style.videosGrid}>
        {videos.map((video) => (
          <Video
            key={video.id}
            video={video}
            currentUser={currentUser}
            isProfileOwner={isProfileOwner}
            mode={mode}
            onPlay={onPlayVideo}
            addToLibrary={addOptimistic}
            removeFromLibrary={removeOptimistic}
            toggleLike={toggleLikes}
            onDelete={deleteVideo}
            toggleComments={toggleComments}
            updateViewCount={updateViewCount}
            updateGlobalViewCount={updateGlobalViewCount}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </ContentState>
  );
};
