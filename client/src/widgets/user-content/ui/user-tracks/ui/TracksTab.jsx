import { useEffect } from 'react';
import style from './TracksTab.module.css';
import { TrackCard } from '../../../../../entities/track';
import { EmptyState, Pagination, Loading } from '../../../../../shared/ui';

/**
 * Вкладка с сеткой треков.
 * @param {Object} props
 * @param {Array} props.items - массив треков
 * @param {Object} props.pagination - данные пагинации
 * @param {Object} props.currentTrack - текущий воспроизводимый трек
 * @param {boolean} props.isPlaying - сейчас трек играет или нет
 * @param {Function} props.onPlayTrack - воспоризведение трека
 * @param {Function} props.togglePlay - переключение трека (пауза/плей)
 * @param {Function} props.onTrackStart - увеличение счетчика прослушиваний при клике на кнопки next/prev (вперед/назад) на аудио-плеере
 * @param {boolean} props.isLoadingTracks - загружен трек или нет
 * @param {string} errorTracks - ошибка
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {Function} props.onAddToLibrary - добавить в библиотеку
 * @param {Function} props.onRemoveFromLibrary - удалить из библиотеки
 * @param {Function} props.toggleLikeTrack - лайк/дизлайк
 * @param {Function} props.updatePlayCount - обновить личный счетчик прослушиваний
 *@param {Function} props.updateGlobalPlayCount - обновить глобальный счетчик прослушиваний
 * @param {Function} props.toggleFavoriteTrack - удалить/добавить в избранное
 * @param {Function} props.onDeleteTrack - удалить трек
 * @param {Function} props.onToggleComments - открыть комментарии

 
 */
export const TracksTab = ({
  items = [],
  mode,
  pagination,
  currentTrack,
  isPlaying,
  onPlayTrack,
  togglePlay,
  onTrackStart,
  isLoadingTracks,
  errorTracks,
  currentUser,
  isProfileOwner,
  onAddToLibrary,
  onRemoveFromLibrary,
  toggleLikeTrack,
  updatePlayCount,
  updateGlobalPlayCount,
  toggleFavoriteTrack,
  onDeleteTrack,
  onToggleComments,
}) => {
  useEffect(() => {
    if (typeof onTrackStart !== 'function') return;

    onTrackStart((track) => {
      const currentTrackInList = items.find((item) => item.id === track.id);
      const profileLibraryId = currentTrackInList?.profileLibraryId || track.profileLibraryId;

      const playCount = currentTrackInList?.playCount ?? track.playCount;
      const newPlayCount = (playCount ?? 0) + 1;

      if (profileLibraryId) {
        updatePlayCount?.(
          track.id,
          profileLibraryId,
          currentTrackInList?.isFavorite ?? track.isFavorite,
          newPlayCount
        );
      } else {
        updateGlobalPlayCount?.(track.id);
      }
    });

    return () => onTrackStart(null);
  }, [onTrackStart, updatePlayCount, updateGlobalPlayCount, items]);

  // Состояние загрузки вкладки с треками
  if (isLoadingTracks) {
    return <Loading fullPage message="Загружаем треки..." size="large" />;
  }

  if (!items?.length) {
    return (
      <div className={style.emptyWrapper}>
        <EmptyState
          icon="🎵"
          title="Нет треков"
          description={
            currentUser?.id === items?.[0]?.uploadedBy
              ? 'Добавьте первые треки в свой профиль!'
              : 'У пользователя пока нет публичных треков'
          }
        />
      </div>
    );
  }

  return (
    <>
      <div className={style.tracksGrid}>
        {items.map((track) => {
          const isOwn = track.uploadedBy === currentUser?.id;
          return (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              onPlay={onPlayTrack}
              toggle={togglePlay}
              allTracks={items}
              currentUser={currentUser}
              isOwn={isOwn}
              isProfileOwner={isProfileOwner}
              mode={mode}
              addToLibrary={onAddToLibrary}
              removeFromLibrary={onRemoveFromLibrary}
              toggleLike={toggleLikeTrack}
              onDelete={onDeleteTrack}
              toggleComments={onToggleComments}
              toggleFavorite={toggleFavoriteTrack}
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
