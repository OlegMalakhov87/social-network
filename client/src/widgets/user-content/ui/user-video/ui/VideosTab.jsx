import style from './VideosTab.module.css';
import { VideoCard } from '../../../../../entities/video';
import { EmptyState, Pagination, Loading } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой видео.
 * @param {Object} props
 * @param {Array} props.items - массив видео
 * @param {Object} props.pagination - данные пагинации
 * @param {Function} props.onClickVideo - воспроизведение видео
 * @param {boolean} props.isLoadingVideos - загружено видео или нет
 * @param {string} errorVideos - ошибка
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {Function} props.onAddToLibrary - добавить в библиотеку
 * @param {Function} props.onRemoveFromLibrary - удалить из библиотеки
 * @param {Function} props.toggleLikeVideo - лайк/дизлайкч
 * @param {Function} props.updateViewCount - обновить личный  счетчик просмотров
 * @param {Function} props.updateGlobalViewCount - обновить глобальный счетчик просмотров
 * @param {Function} props.toggleFavoriteVideo - удалить/добавить в избранное
 * @param {Function} props.onDeleteVideo - удалить видео
 * @param {Function} props.onToggleComments - открыть комментарии
 */
export const VideosTab = ({
  items = [],
  mode,
  pagination,
  onClickVideo,
  isLoadingVideos,
  errorVideos,
  currentUser,
  isProfileOwner,
  onAddToLibrary,
  onRemoveFromLibrary,
  toggleLikeVideo,
  updateViewCount,
  updateGlobalViewCount,
  toggleFavoriteVideo,
  onDeleteVideo,
  onToggleComments,
}) => {
  // Состояние загрузки вкладки с видео
  if (isLoadingVideos) {
    return <Loading fullPage message="Загружаем видео..." size="large" />;
  }

  if (!items?.length) {
    return (
      <div className={style.emptyWrapper}>
        <EmptyState
          icon="🎬"
          title="Нет видео"
          description={
            currentUser?.id === items?.[0]?.uploadedBy
              ? 'Загрузите первые видео в свой профиль!'
              : 'У пользователя пока нет публичных видео'
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className={style.videosGrid}>
        {items.map((video) => {
          const isOwn = video.uploadedBy === currentUser?.id;
          return (
            <VideoCard
              key={video.id}
              video={video}
              currentUser={currentUser}
              isOwn={isOwn}
              isProfileOwner={isProfileOwner}
              mode={mode}
              onPlay={onClickVideo}
              addToLibrary={onAddToLibrary}
              removeFromLibrary={onRemoveFromLibrary}
              toggleLike={toggleLikeVideo}
              onDelete={onDeleteVideo}
              toggleComments={onToggleComments}
              updateViewCount={updateViewCount}
              updateGlobalViewCount={updateGlobalViewCount}
              toggleFavorite={toggleFavoriteVideo}
            />
          );
        })}
      </div>

      {pagination?.totalPages > 1 && (
        <Pagination
          totalPages={pagination.totalPages}
          page={pagination.currentPage}
          onPageChange={pagination.goToPage}
        />
      )}
    </>
  );
};
