import { useCallback, useState } from 'react';
import { GENRE_TABS } from '../../../entities/track';
import { useCommentsPanel } from '../../../features/comments';
import { TrackForm, useMusic } from '../../../features/tracks';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls } from '../../../shared/hooks';
import {
  Dropdown,
  ErrorBoundary,
  IconButton,
  PageLayout,
  SearchField,
  SectionCard,
  Toolbar,
} from '../../../shared/ui';
import { useAudioPlayer } from '../../../widgets/audio-player';
import { TracksTab } from '../../../widgets/user-content';

/**
 * Страница музыки с фильтрацией и сортировкой, формой добавления трека, списком треков и панелью комментариев.
 */

export const MusicPage = () => {
  const [showTrackForm, setShowTrackForm] = useState(false);

  /** Управление фильтрацией и сортировкой */
  const {
    filter,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    handleFilterChange,
  } = useFilterControls({ initialFilter: 'all', initialSort: 'dateDesc' });

  /** Получение данных о треках */
  const {
    tracks,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    currentPage,
    refetch,
    toggleLike,
    addTrack,
    updateTrack,
    deleteTrack,
    addToLibrary,
    deleteFromLibrary,
    updateGlobalPlaysCount,
    updateCommentsCount,
  } = useMusic({ filter, searchQuery, sortKey });

  /** Управление аудиоплеером */
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /** Управление панелью комментариев */
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('tracks', sortKey, filter, currentPage);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentsCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentsCount]
  );

  /** Обработчик для отправки формы */
  const handleFormSubmit = useCallback(
    async (values, isEdit, trackId) => {
      if (isEdit && trackId) {
        await updateTrack?.(trackId, values);
      } else {
        await addTrack?.(values);
      }
      setShowTrackForm(null);
    },
    [addTrack, updateTrack]
  );

  /** Обработчик для закрытия формы */
  const handleCloseForm = useCallback(() => {
    setShowTrackForm(null);
  }, []);

  return (
    <ErrorBoundary>
      <PageLayout
        title="Музыка"
        actions={
          currentUser && (
            <IconButton
              icon="➕"
              variant="primary"
              size="md"
              onClick={() => setShowTrackForm('create')}
              ariaLabel="Добавить трек"
            />
          )
        }
      >
        <SectionCard>
          <Toolbar
            tabs={GENRE_TABS}
            activeTab={filter}
            onTabChange={handleFilterChange}
            rightSlot={
              <>
                <SearchField
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск треков или исполнителей..."
                />
                <Dropdown
                  options={SORT_OPTIONS}
                  currentSort={sortKey}
                  onChange={setSortKey}
                />
              </>
            }
          />

          <TracksTab
            tracks={tracks}
            mode="general"
            hasMore={hasMore}
            loadMore={loadMore}
            currentUser={currentUser}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlay={playTrack}
            togglePlay={togglePlay}
            onTrackStart={setOnTrackStart}
            toggleLike={toggleLike}
            addOptimistic={addToLibrary}
            deleteOptimistic={deleteFromLibrary}
            deleteTrack={deleteTrack}
            updateTrack={setShowTrackForm}
            updateGlobalPlaysCount={updateGlobalPlaysCount}
            toggleComments={onToggleComments}
            commentTarget={commentTarget}
            onCloseComments={handleCloseComments}
            onCommentChange={handleCommentChange}
            onRetry={refetch}
            updateCommentsCount={updateCommentsCount}
          />
        </SectionCard>

        {showTrackForm && currentUser && (
          <TrackForm
            key={
              showTrackForm === 'create' ? 'create' : `edit-${showTrackForm.id}`
            }
            initialData={showTrackForm === 'create' ? null : showTrackForm}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
          />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
