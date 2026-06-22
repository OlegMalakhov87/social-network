import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import style from './MusicPage.module.css';
import { CommentsSection } from '../../../widgets/comments-list';
import { useAudioPlayer } from '../../../widgets/audio-player';
import { TracksTab } from '../../../widgets/user-content';
import { useMusic, TrackForm } from '../../../features/tracks';
import { useCommentsPanel } from '../../../features/comments';
import { EmptyState, FilterButton, SortDropdown, Loading, SearchInput } from '../../../shared/ui';
import { usePagination } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Страница музыки – отображает каталог треков с фильтрацией по жанру, поиском и сортировкой.
 */
export const MusicPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');
  const [sortKey, setSortKey] = useState('dateDesc');
  const [showTrackForm, setShowTrackForm] = useState(false);

  const currentUser = useSelector((state) => state.auth?.user);

  const {
    tracks,
    paginationTracks,
    isLoadingTracks,
    errorTracks,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updateGlobalPlayCount,
    updateCommentCount,
  } = useMusic({ filter: genreFilter, searchQuery, sortKey });

  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } = useAudioPlayer();

  const pagination = usePagination(tracks, 12, 1);

  const { commentTarget, handleCloseComments, onToggleComments } = useCommentsPanel(
    'Music',
    genreFilter,
    pagination.currentPage
  );

  const handleCommentChange = useCallback(
    (delta) => {
      updateCommentCount(commentTarget.id, delta);
    },
    [commentTarget?.id, updateCommentCount]
  );

  const CATEGORIES = [
    { id: 'All', name: 'Все' },
    { id: 'Rock', name: 'Рок' },
    { id: 'Pop', name: 'Поп' },
    { id: 'Jazz', name: 'Джаз' },
    { id: 'Classical', name: 'Классика' },
    { id: 'Electronic', name: 'Электроника' },
  ];

  if (isLoadingTracks && tracks.length === 0) {
    return <Loading fullPage message="Загружаем треки..." size="large" />;
  }

  return (
    <div className={style.music}>
      <div className={style.header}>
        <h1 className={style.title}>Музыка</h1>
        <div className={style.search}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск треков или исполнителей ..."
          />
        </div>
      </div>

      <div className={style.filters}>
        {CATEGORIES.map((cat) => (
          <FilterButton
            key={cat.id}
            cat={cat}
            filter={genreFilter}
            onChangeButtonFilter={(id) => {
              setGenreFilter(id);
              setSearchQuery('');
              setSortKey('dateDesc');
            }}
          />
        ))}
        {currentUser && (
          <button
            className={style.addButton}
            onClick={(e) => {
              e?.stopPropagation();
              setShowTrackForm((prev) => !prev);
            }}
            aria-label="Добавить трек"
          >
            ➕
          </button>
        )}
        <SortDropdown options={SORT_OPTIONS} currentSort={sortKey} onChange={setSortKey} />
      </div>

      {tracks.length > 0 ? (
        <TracksTab
          items={pagination.paginatedItems}
          pagination={pagination}
          errorTracks={errorTracks}
          currentUser={currentUser}
          mode="general"
          isPlaying={isPlaying}
          currentTrack={currentTrack}
          onPlayTrack={playTrack}
          togglePlay={togglePlay}
          onTrackStart={setOnTrackStart}
          onAddToLibrary={addTrackOptimistic}
          onRemoveFromLibrary={removeTrackOptimistic}
          toggleLikeTrack={toggleLikeTrack}
          onToggleComments={onToggleComments}
          updateGlobalPlayCount={updateGlobalPlayCount}
        />
      ) : (
        <EmptyState
          icon="🎵"
          title="Треки не найдены"
          description="Попробуйте изменить параметры поиска или выберите другую категорию"
        />
      )}

      {showTrackForm && currentUser && (
        <TrackForm
          onClose={(e) => {
            e?.stopPropagation();
            setShowTrackForm(false);
          }}
        />
      )}

      {commentTarget && (
        <CommentsSection
          targetType={commentTarget?.type}
          targetId={commentTarget?.id}
          currentUser={currentUser}
          updateCommentCount={handleCommentChange}
          closeComments={handleCloseComments}
        />
      )}
    </div>
  );
};
