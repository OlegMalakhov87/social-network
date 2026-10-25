import { useCallback, useRef, useState } from 'react';

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
import { VideosTab } from '../../../widgets/user-content';
import { VideoPlayer } from '../../../widgets/video-player';

/**
 * Отображает страницу видео.
 *
 * @returns {JSX.Element} Разметка страницы.
 */
export const VideosPage = () => {
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const onVideoStartRef = useRef(null);

  const {
    filter,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    handleFilterChange,
  } = useFilterControls({ initialFilter: 'all', initialSort: 'dateDesc' });

  const {
    videos,
    currentUser,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    currentPage,
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

  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('videos', sortKey, filter, currentPage);

  /**
   * Обновляет число комментариев открытой записи.
   *
   * @param {number} delta - Изменение числа комментариев
   * @returns {boolean} Признак обновления.
   */
  const handleCommentChange = useCallback(
    (delta) => updateCommentsCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentsCount]
  );

  /**
   * Открывает видео в плеере.
   *
   * @param {Object|Function} video - Данные видео или обработчик
   * @returns {void}
   */
  const handleOpenVideo = useCallback((video) => {
    if (!video || typeof video === 'function') return;
    setSelectedVideo(video);
  }, []);

  /**
   * Сохраняет обработчик запуска видео.
   *
   * @param {Function} handler - Обработчик запуска
   * @returns {void}
   */
  const setOnVideoStart = useCallback((handler) => {
    onVideoStartRef.current = handler;
  }, []);

  /**
   * Запускает воспроизведение видео.
   *
   * @param {Object} video - Данные видео
   * @returns {void}
   */
  const handleVideoPlayStart = useCallback((video) => {
    onVideoStartRef.current?.(video);
  }, []);

  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  /**
   * Отправляет форму видео.
   *
   * @param {Object} values - Данные формы
   * @param {boolean} isEdit - Признак редактирования
   * @param {number|undefined} videoId - Идентификатор видео
   * @returns {Promise<void>}
   */
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

  const handleCloseForm = useCallback(() => {
    setShowVideoForm(null);
  }, []);

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

          <VideosTab
            videos={videos}
            currentUser={currentUser}
            toggleComments={onToggleComments}
            commentTarget={commentTarget}
            onCloseComments={handleCloseComments}
            onCommentChange={handleCommentChange}
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

        {showVideoForm && currentUser && (
          <VideoForm
            key={
              showVideoForm === 'create' ? 'create' : `edit-${showVideoForm.id}`
            }
            initialData={showVideoForm === 'create' ? null : showVideoForm}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
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
