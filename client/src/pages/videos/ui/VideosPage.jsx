import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import style from './VideosPage.module.css';
import { CommentsSection } from '../../../widgets/comments-list';
import { VideoPlayer } from '../../../widgets/video-player';
import { VideosTab } from '../../../widgets/user-content';
import { useVideos, VideoForm } from '../../../features/videos';
import { useCommentsPanel } from '../../../features/comments';
import { EmptyState, FilterButton, SortDropdown, Loading, SearchInput } from '../../../shared/ui';
import { usePagination } from '../../../shared/lib';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Страница видео – отображает каталог видео с фильтрацией по категориям, поиском и сортировкой.
 */
export const VideosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortKey, setSortKey] = useState('dateDesc');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoForm, setShowVideoForm] = useState(false);

  const currentUser = useSelector((state) => state.auth?.user);

  const {
    videos,
    paginationVideos,
    isLoadingVideos,
    errorVideos,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateGlobalViewCount,
    updateCommentCount,
  } = useVideos({ filter: categoryFilter, searchQuery, sortKey });

  const pagination = usePagination(videos, 12, 1);

  const { commentTarget, handleCloseComments, onToggleComments } = useCommentsPanel(
    'Video',
    categoryFilter,
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
    { id: 'Movie', name: 'Кино' },
    { id: 'Music', name: 'Музыка' },
    { id: 'Sports', name: 'Спорт' },
    { id: 'Travel', name: 'Путешествия' },
    { id: 'Openings', name: 'Открытия' },
  ];

  // Открыть/закрыть модальное окно с видео
  const handleClickVideo = useCallback((video) => setSelectedVideo(video), []);
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  if (isLoadingVideos && videos.length === 0) {
    return <Loading fullPage message="Загружаем видео..." size="large" />;
  }

  return (
    <div className={style.videos}>
      <div className={style.header}>
        <h1 className={style.title}>Видео</h1>
        <div className={style.search}>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск видео ..."
          />
        </div>
      </div>

      <div className={style.filters}>
        {CATEGORIES.map((cat) => (
          <FilterButton
            key={cat.id}
            cat={cat}
            filter={categoryFilter}
            onChangeButtonFilter={(id) => {
              setCategoryFilter(id);
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
              setShowVideoForm((prev) => !prev);
            }}
            aria-label="Добавить видео"
          >
            ➕
          </button>
        )}
        <SortDropdown options={SORT_OPTIONS} currentSort={sortKey} onChange={setSortKey} />
      </div>

      {videos.length > 0 ? (
        <VideosTab
          items={pagination.paginatedItems}
          pagination={pagination}
          errorVideos={errorVideos}
          currentUser={currentUser}
          mode="general"
          onAddToLibrary={addVideoOptimistic}
          onRemoveFromLibrary={removeVideoOptimistic}
          toggleLikeVideo={toggleLikeVideo}
          onClickVideo={handleClickVideo}
          onToggleComments={onToggleComments}
          updateGlobalViewCount={updateGlobalViewCount}
        />
      ) : (
        <EmptyState
          icon="🎬"
          title="Видео не найдены"
          description="Попробуйте изменить параметры поиска или выберите другую категорию"
        />
      )}

      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />}

      {showVideoForm && currentUser && (
        <VideoForm
          onClose={(e) => {
            e?.stopPropagation();
            setShowVideoForm(false);
          }}
        />
      )}

      {commentTarget && (
        <CommentsSection
          targetType={commentTarget.type}
          targetId={commentTarget.id}
          currentUser={currentUser}
          updateCommentCount={handleCommentChange}
          closeComments={handleCloseComments}
        />
      )}
    </div>
  );
};
