import { useEffect, useRef } from 'react';

import { Track } from '../../../../entities/track';
import { useInfiniteScrollTrigger } from '../../../../shared/hooks';
import {
  ContentRefetchOverlay,
  ContentState,
  InfiniteScrollFooter,
} from '../../../../shared/ui';
import { CommentableGrid } from '../../../comment';

import styles from './TracksTab.module.css';

/**
 * Отображает вкладку с сеткой треков.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.tracks=[]] - Список треков
 * @param {string} props.mode - Режим отображения
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Object} props.currentUser - Текущий пользователь
 * @param {boolean} props.isOwnProfile - Признак собственного профиля
 * @param {boolean} props.isLoading - Признак загрузки списка
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {Error|string|null} props.error - Ошибка загрузки
 * @param {Object} props.currentTrack - Текущий трек
 * @param {boolean} props.isPlaying - Признак воспроизведения текущего трека
 * @param {Function} props.onPlay - Обработчик воспроизведения трека
 * @param {Function} props.togglePlay - Обработчик паузы и воспроизведения
 * @param {Function} [props.onTrackStart] - Обработчик старта воспроизведения
 * @param {Function} props.toggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.addOptimistic - Обработчик добавления трека в библиотеку
 * @param {Function} props.deleteOptimistic - Обработчик удаления трека из библиотеки
 * @param {Function} props.deleteTrack - Обработчик удаления трека
 * @param {Function} props.updateTrack - Обработчик обновления трека
 * @param {Function} [props.updatePlaysCount] - Обработчик личного счётчика прослушиваний
 * @param {Function} [props.updateGlobalPlaysCount] - Обработчик общего счётчика прослушиваний
 * @param {Function} props.toggleFavorite - Обработчик переключения избранного
 * @param {Function} props.toggleComments - Обработчик открытия комментариев
 * @param {Object|null} props.commentTarget - Открытая цель комментариев
 * @param {Function} props.onCloseComments - Обработчик закрытия комментариев
 * @param {Function} props.onCommentChange - Обработчик изменения количества комментариев
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @returns {JSX.Element} Разметка вкладки.
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
  // Оставляет в эффекте актуальный список без повторной подписки на каждый ответ.
  tracksRef.current = tracks;

  // Показывает наложение, пока список обновляется при уже загруженных треках.
  const isRefetching = isLoading && tracks.length > 0;

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  useEffect(() => {
    if (typeof onTrackStart !== 'function') return;

    /**
     * Увеличивает счётчик прослушиваний запущенного трека.
     *
     * @param {Object} track - Запущенный трек
     */
    onTrackStart((track) => {
      if (!track?.id) return;

      const currentTrackInList = tracksRef.current.find(
        (item) => item.id === track?.id
      );
      const profileLibraryId =
        currentTrackInList?.profileLibraryId || track.profileLibraryId;

      if (profileLibraryId) {
        updatePlaysCount?.(track.id, profileLibraryId);
      } else {
        updateGlobalPlaysCount?.(track.id);
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
          mode === 'profile'
            ? isOwnProfile
              ? 'Добавьте свои первые треки.'
              : 'У пользователя пока нет публичных треков.'
            : 'Попробуйте изменить категорию или поисковый запрос.'
        }
        onRetry={onRetry}
      >
        <div className={styles.content}>
          <CommentableGrid
            items={tracks}
            commentTarget={commentTarget}
            onToggleComments={toggleComments}
            onCloseComments={onCloseComments}
            currentUser={currentUser}
            onCommentChange={onCommentChange}
            renderItem={({ item, onToggleComments }) => (
              <Track
                track={item}
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
                toggleComments={onToggleComments}
                updateTrack={updateTrack}
                onDelete={deleteTrack}
              />
            )}
          />

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
