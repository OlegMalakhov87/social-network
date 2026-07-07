import { useEffect } from 'react';
import { Track } from '../../../../../entities/track';
import { ContentState } from '../../../../../shared/ui';
import style from './TracksTab.module.css';

/**
 * Вкладка с сеткой треков.
 * @param {Object} props
 * @param {Array} props.tracks - массив треков
 * @param {string} props.mode - режим отображения (library/global)
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.targetUser - выбранный пользователь
 * @param {boolean} props.isProfileOwner - владелец профиля
 * @param {boolean} props.isLoading - загружен трек или нет
 * @param {string} props.error - ошибка
 * @param {Object} props.currentTrack - текущий воспроизводимый трек
 * @param {boolean} props.isPlaying - сейчас трек играет или нет
 * @param {Function} props.onPlay - воспоризведение трека
 * @param {Function} props.togglePlay - переключение трека (пауза/плей)
 * @param {Function} props.onTrackStart - увеличение счетчика прослушиваний при клике на кнопки next/prev (вперед/назад) на аудио-плеере
 * @param {Function} props.addOptimistic - добавить оптимистический трек
 * @param {Function} props.removeOptimistic - удалить оптимистический трек
 * @param {Function} props.updatePlayCount - обновить личный счетчик прослушиваний
 * @param {Function} props.updateGlobalPlayCount - обновить глобальный счетчик прослушиваний
 * @param {Function} props.toggleFavorite - удалить/добавить в избранное
 * @param {Function} props.onToggleComments - открыть комментарии
 * @param {Function} props.onRetry - повторить загрузку
 */
export const TracksTab = ({
  tracks = [],
  mode,
  currentUser,
  targetUser,
  isProfileOwner,
  isLoading,
  error,
  currentTrack,
  isPlaying,
  onPlay,
  onTrackStart,
  togglePlay,
  toggleLike,
  addOptimistic,
  removeOptimistic,
  updatePlayCount,
  updateGlobalPlayCount,
  toggleFavorite,
  onToggleComments,
  onRetry,
}) => {
  /** Обработчик для увеличения счетчика прослушиваний при клике на кнопки next/prev (вперед/назад) на аудио-плеере */
  useEffect(() => {
    if (typeof onTrackStart !== 'function') return;

    onTrackStart((track) => {
      const currentTrackInList = tracks.find((item) => item.id === track?.id);
      const profileLibraryId =
        currentTrackInList?.profileLibraryId || track.profileLibraryId;

      const playCount = currentTrackInList?.playCount ?? track?.playCount;
      const newPlayCount = (playCount ?? 0) + 1;

      if (profileLibraryId) {
        updatePlayCount?.(
          track?.id,
          profileLibraryId,
          currentTrackInList?.isFavorite ?? track?.isFavorite,
          newPlayCount
        );
      } else {
        updateGlobalPlayCount?.(track?.id);
      }
    });

    return () => onTrackStart(null);
  }, [onTrackStart, updatePlayCount, updateGlobalPlayCount, tracks]);

  return (
    <ContentState
      loading={isLoading || (!currentUser && !targetUser)}
      error={error}
      isEmpty={!tracks?.length}
      loadingMessage="Загружаем треки..."
      emptyIcon="🎵"
      emptyTitle="Нет треков"
      emptyDescription={
        isProfileOwner
          ? 'Добавьте свои первые треки.'
          : 'У пользователя пока нет публичных треков.'
      }
      onRetry={onRetry}
    >
      <div className={style.tracksGrid}>
        {tracks.map((track) => (
          <Track
            key={track.id}
            track={track}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            onPlay={onPlay}
            togglePlay={togglePlay}
            allTracks={tracks}
            currentUser={currentUser}
            isProfileOwner={isProfileOwner}
            mode={mode}
            addToLibrary={addOptimistic}
            removeFromLibrary={removeOptimistic}
            toggleLike={toggleLike}
            onDelete={removeOptimistic}
            toggleComments={onToggleComments}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </ContentState>
  );
};
