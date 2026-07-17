import { useCallback, useEffect, useRef, useState } from 'react';
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
import { CommentsSection } from '../../../widgets/comments-list';
import { TracksTab } from '../../../widgets/user-content';

/**
 * Страница музыки с фильтрацией и сортировкой, формой добавления трека, списком треков и панелью комментариев.
 */

export const MusicPage = () => {
  const [showTrackForm, setShowTrackForm] = useState(false);
  const commentsSectionRef = useRef(null);

  /** Управление фильтрацией и сортировкой */
  const {
    genre: filter,
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
    refetch,
    toggleLike,
    addTrack,
    updateTrack,
    deleteTrack,
    addToLibrary,
    removeFromLibrary,
    incrementPlayCount,
    updateCommentCount,
  } = useMusic({ filter, searchQuery, sortKey });

  /** Управление аудиоплеером */
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /** Управление панелью комментариев */
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('tracks', sortKey, filter);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentCount]
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

  /** Скролл к секции комментариев при открытии панели */
  useEffect(() => {
    if (!commentTarget?.id || !commentTarget?.type) return;
    commentsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [commentTarget?.id, commentTarget?.type]);

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

          {showTrackForm && currentUser && (
            <TrackForm
              key={
                showTrackForm === 'create'
                  ? 'create'
                  : `edit-${showTrackForm.id}`
              }
              initialData={showTrackForm === 'create' ? null : showTrackForm}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
            />
          )}

          <TracksTab
            tracks={tracks}
            mode="general"
            currentUser={currentUser}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            loadMore={loadMore}
            onRetry={refetch}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlay={playTrack}
            togglePlay={togglePlay}
            onTrackStart={setOnTrackStart}
            addOptimistic={addToLibrary}
            removeOptimistic={removeFromLibrary}
            updateTrack={setShowTrackForm}
            deleteTrack={deleteTrack}
            incrementPlayCount={incrementPlayCount}
            toggleLike={toggleLike}
            onToggleComments={onToggleComments}
          />
        </SectionCard>

        {commentTarget && currentUser && (
          <CommentsSection
            targetType={commentTarget?.type}
            targetId={commentTarget?.id}
            currentUser={currentUser}
            onChange={handleCommentChange}
            onCloseComments={handleCloseComments}
            commentsSectionRef={commentsSectionRef}
          />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
