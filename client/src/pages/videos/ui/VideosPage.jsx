import { useCallback, useEffect, useRef, useState } from 'react';
import { CATEGORIES } from '../../../entities/video';
import { useCommentsPanel } from '../../../features/comments';
import { VideoForm, useVideos } from '../../../features/videos';
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
import { CommentsSection } from '../../../widgets/comments-list';
import { VideosTab } from '../../../widgets/user-content';
import { VideoPlayer } from '../../../widgets/video-player';

/**
 * Страница видео – отображает каталог видео с фильтрацией, поиском и сортировкой.
 */
export const VideosPage = () => {
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const commentsSectionRef = useRef(null);

  /** Управление фильтрацией и сортировкой */
  const {
    category: filter,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    handleFilterChange,
  } = useFilterControls({ initialFilter: 'all', initialSort: 'dateDesc' });

  /** Получение данных о видео */
  const {
    videos,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refetch,
    toggleLike,
    addVideo,
    updateVideo,
    deleteVideo,
    addToLibrary,
    removeFromLibrary,
    incrementViewCount,
    updateCommentCount,
  } = useVideos({ filter, searchQuery, sortKey });

  /** Управление панелью комментариев */
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('Video', sortKey, filter);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentCount]
  );

  /** Обработчик для открытия модального окна с видео*/
  const handleOpenVideo = useCallback((video) => setSelectedVideo(video), []);
  /** Обработчик для закрытия модального окна с видео*/
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  /** Обработчик для отправки формы */
  const handleFormSubmit = useCallback(
    async (values, isEdit, videoId) => {
      if (isEdit && videoId) {
        await updateVideo?.(videoId, values);
      } else {
        await addVideo?.(values);
      }
      setVideoToEdit(null);
    },
    [addVideo, updateVideo]
  );

  /** Скролл к секции комментариев при открытии */
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
        title="Видео"
        actions={
          currentUser && (
            <IconButton
              icon="➕"
              variant="primary"
              size="md"
              onClick={() => setVideoToEdit('create')}
              ariaLabel="Добавить видео"
            />
          )
        }
      >
        <SectionCard>
          <Toolbar
            tabs={CATEGORIES}
            activeTab={filter}
            onTabChange={handleFilterChange}
            rightSlot={
              <>
                <SearchField
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск видео..."
                />
                <Dropdown
                  options={SORT_OPTIONS}
                  currentSort={sortKey}
                  onChange={setSortKey}
                />
              </>
            }
          />

          {videoToEdit && currentUser && (
            <VideoForm
              key={
                videoToEdit === 'create' ? 'create' : `edit-${videoToEdit.id}`
              }
              initialData={videoToEdit === 'create' ? null : videoToEdit}
              onClose={handleCloseVideo}
              onSubmit={handleFormSubmit}
            />
          )}

          <VideosTab
            videos={videos}
            mode="general"
            currentUser={currentUser}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            error={error}
            loadMore={loadMore}
            onRetry={refetch}
            onPlayVideo={handleOpenVideo}
            toggleLike={toggleLike}
            onToggleComments={onToggleComments}
            addOptimistic={addToLibrary}
            removeOptimistic={removeFromLibrary}
            updateGlobalViewCount={incrementViewCount}
            updateVideo={setVideoToEdit}
            deleteVideo={deleteVideo}
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
        {selectedVideo && (
          <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
