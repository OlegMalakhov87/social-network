import { useEffect, useRef } from 'react';
import { Track } from '../../../../entities/track';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import { EntityWithComments } from '../../../entity-comments';
import styles from './TracksTab.module.css';

/**
 * Вкладка с сеткой треков.
 * @param {Object} props
 * @param {Array} props.tracks - массив треков
 * @param {string} props.mode - режим отображения (library/global)
 * @param {boolean} props.hasMore - флаг наличия следующей страницы треков
 * @param {Function} props.loadMore - функция для загрузки следующей страницы треков
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isOwnProfile - владелец профиля
 * @param {boolean} props.isLoading - флаг общей загрузки треков
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей страницы треков
 * @param {string} props.error - ошибка
 * @param {Object} props.currentTrack - текущий воспроизводимый трек
 * @param {boolean} props.isPlaying - сейчас трек играет или нет
 * @param {Function} props.onPlay - воспоризведение трека
 * @param {Function} props.togglePlay - переключение трека (пауза/плей)
 * @param {Function} props.onTrackStart - увеличение счетчика прослушиваний при клике на кнопки next/prev (вперед/назад) на аудио-плеере
 * @param {Function} props.addOptimistic - добавить трек в библиотеку
 * @param {Function} props.deleteOptimistic - удалить из библиотеки
 * @param {Function} props.deleteTrack - удалить трек
 * @param {Function} props.updateTrack - обновить трек
 * @param {Function} props.updatePlaysCount - обновить личный счетчик прослушиваний
 * @param {Function} props.updateGlobalPlaysCount - обновить глобальный счетчик прослушиваний
 * @param {Function} props.toggleFavorite - удалить/добавить в избранное
 * @param {Function} props.toggleComments - открыть комментарии
 * @param {Object} props.commentTarget - целевой тип и id комментариев
 * @param {Function} props.onCloseComments - закрыть комментарии
 * @param {Function} props.onCommentChange - изменить количество комментариев
 * @param {Function} props.onRetry - повторить загрузку
 */

export const TracksTab = ({
  tracks = [],
  mode,
  hasMore,
  loadMore,
  currentUser,
  isOwnProfile,
  isLoading,
  isLoadingMore,
  error,
  currentTrack,
  isPlaying,
  onPlay,
  togglePlay,
  onTrackStart,
  toggleLike,
  addOptimistic,
  deleteOptimistic,
  deleteTrack,
  updateTrack,
  updatePlaysCount,
  updateGlobalPlaysCount,
  toggleFavorite,
  toggleComments,
  commentTarget,
  onCloseComments,
  onCommentChange,
  onRetry,
}) => {
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  /** Флаг перезагрузки контента */
  const isRefetching = isLoading && tracks.length > 0;

  /** Триггер для автоматической загрузки следующей страницы */
  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  /** Обработчик для увеличения счетчика прослушиваний при клике на кнопки next/prev (вперед/назад) на аудио-плеере */
  useEffect(() => {
    if (typeof onTrackStart !== 'function') return;

    onTrackStart((track) => {
      const currentTrackInList = tracksRef.current.find(
        (item) => item.id === track?.id
      );
      const profileLibraryId =
        currentTrackInList?.profileLibraryId || track.profileLibraryId;

      const playsCount = currentTrackInList?.playsCount ?? track?.playsCount;
      const newPlaysCount = (playsCount ?? 0) + 1;

      if (profileLibraryId) {
        updatePlaysCount?.(
          track?.id,
          profileLibraryId,
          currentTrackInList?.isFavorite ?? track?.isFavorite,
          newPlaysCount
        );
      } else {
        updateGlobalPlaysCount?.(track?.id);
      }
    });

    return () => onTrackStart(null);
  }, [onTrackStart, updatePlaysCount, updateGlobalPlaysCount]);

  return (
    <div className={styles.contentArea}>
      <ContentState
        loading={isLoading && tracks.length === 0}
        error={tracks.length === 0 ? error : null}
        isEmpty={!tracks?.length}
        loadingMessage="Загружаем треки..."
        emptyIcon="🎵"
        emptyTitle="Нет треков"
        emptyDescription={
          isOwnProfile
            ? 'Добавьте свои первые треки.'
            : 'У пользователя пока нет публичных треков.'
        }
        onRetry={onRetry}
      >
        <div className={styles.tracksGrid}>
          {tracks.map((track) => (
            <EntityWithComments
              key={track.id}
              entity={track}
              targetType="tracks"
              isOpen={commentTarget?.id === track.id}
              onClose={onCloseComments}
              currentUser={currentUser}
              onCommentChange={onCommentChange}
              renderEntity={(entity) => (
                <Track
                  track={entity}
                  allTracks={tracks}
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  currentUser={currentUser}
                  isOwnProfile={isOwnProfile}
                  mode={mode}
                  onPlay={onPlay}
                  togglePlay={togglePlay}
                  addToLibrary={addOptimistic}
                  deleteFromLibrary={deleteOptimistic}
                  toggleFavorite={toggleFavorite}
                  toggleLike={toggleLike}
                  toggleComments={toggleComments}
                  updateTrack={updateTrack}
                  onDelete={deleteTrack}
                />
              )}
            />
          ))}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

          {tracks.length > 0 && (
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={error}
              onRetry={loadMore}
              endMessage="Вы просмотрели все треки"
            />
          )}
        </div>
      </ContentState>

      {isRefetching && <ContentRefetchOverlay />}
    </div>
  );
};
