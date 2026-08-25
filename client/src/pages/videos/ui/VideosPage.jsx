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
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const commentsSectionRef = useRef(null);
  const onVideoStartRef = useRef(null);

  /** Управление фильтрацией и сортировкой */
  const {
    filter,
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
    addToLibrary,
    deleteFromLibrary,
    updateGlobalViewsCount,
    updateCommentsCount,
    addVideo,
    updateVideo,
    deleteVideo,
  } = useVideos({ filter, searchQuery, sortKey });

  /** Управление панелью комментариев */
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('videos', sortKey, filter);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentsCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentsCount]
  );

  /** Обработчик для открытия модального окна с видео */
  const handleOpenVideo = useCallback((video) => {
    if (!video || typeof video === 'function') return;
    setSelectedVideo(video);
  }, []);

  const setOnVideoStart = useCallback((handler) => {
    onVideoStartRef.current = handler;
  }, []);

  const handleVideoPlayStart = useCallback((video) => {
    onVideoStartRef.current?.(video);
  }, []);

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
      setShowVideoForm(null);
    },
    [addVideo, updateVideo]
  );

  /** Обработчик для закрытия формы */
  const handleCloseForm = useCallback(() => {
    setShowVideoForm(null);
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
        title="Видео"
        actions={
          currentUser && (
            <IconButton
              icon="➕"
              variant="primary"
              size="md"
              onClick={() => setShowVideoForm('create')}
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

          {showVideoForm && currentUser && (
            <VideoForm
              key={
                showVideoForm === 'create'
                  ? 'create'
                  : `edit-${showVideoForm.id}`
              }
              initialData={showVideoForm === 'create' ? null : showVideoForm}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
            />
          )}

          <VideosTab
            videos={videos}
            currentUser={currentUser}
            toggleComments={onToggleComments}
            toggleLike={toggleLike}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            mode="general"
            onPlayVideo={handleOpenVideo}
            onVideoStart={setOnVideoStart}
            currentVideo={selectedVideo}
            isPlaying={Boolean(selectedVideo)}
            addToLibrary={addToLibrary}
            deleteFromLibrary={deleteFromLibrary}
            hasMore={hasMore}
            loadMore={loadMore}
            onRetry={refetch}
            updateGlobalViewsCount={updateGlobalViewsCount}
            updateVideo={setShowVideoForm}
            deleteVideo={deleteVideo}
          />
        </SectionCard>

        {commentTarget && currentUser && (
          <CommentsSection
            targetType={commentTarget?.type}
            targetId={commentTarget?.id}
            currentUser={currentUser}
            onChange={handleCommentChange}
            onClose={handleCloseComments}
            commentsSectionRef={commentsSectionRef}
          />
        )}
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            onClose={handleCloseVideo}
            onPlayStart={handleVideoPlayStart}
          />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
