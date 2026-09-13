import { useCallback, useRef, useState } from 'react';
import { CATEGORIES } from '../../../entities/news';
import { useCommentsPanel } from '../../../features/comments';
import { NewsForm, useNews } from '../../../features/news';
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
import { NewsList } from '../../../widgets/news-list';
import { VideoPlayer } from '../../../widgets/video-player';

/**
 * Страница новостей – отображает каталог новостей с фильтрацией, поиском и сортировкой.
 */

export const NewsPage = () => {
  const [showNewsForm, setShowNewsForm] = useState(null);
  const [newsVideo, setNewsVideo] = useState(null);
  const onVideoStartRef = useRef(null);

  /** Управление фильтрацией и сортировкой */
  const {
    filter,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    handleFilterChange,
  } = useFilterControls({
    initialFilter: 'all',
    initialSort: 'dateDesc',
  });

  /** Получение данных о новостях */
  const {
    news,
    currentUser,
    hasMore,
    isLoading,
    isLoadingMore,
    currentPage,
    error,
    loadMore,
    refetch,
    addNews,
    deleteNews,
    updateNews,
    toggleLike,
    incrementViewsCount,
    updateCommentsCount,
  } = useNews({
    filter,
    searchQuery,
    sortKey,
  });

  /** Управление панелью комментариев */
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('news', sortKey, filter, currentPage);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentsCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentsCount]
  );

  /** Обработчик для открытия модального окна с видео */
  const handleOpenNewsVideo = useCallback((video) => {
    if (!video || typeof video === 'function') return;
    setNewsVideo(video);
  }, []);

  const setOnVideoStart = useCallback((handler) => {
    onVideoStartRef.current = handler;
  }, []);

  const handleVideoPlayStart = useCallback((video) => {
    onVideoStartRef.current?.(video);
  }, []);

  /** Обработчик для закрытия модального окна с видео*/
  const handleCloseVideo = useCallback(() => setNewsVideo(null), []);

  /** Обработчик для отправки формы */
  const handleFormSubmit = useCallback(
    async (values, isEdit, newsId) => {
      if (isEdit && newsId) {
        await updateNews?.(newsId, values);
      } else {
        await addNews?.(values);
      }
      setShowNewsForm(null);
    },
    [addNews, updateNews]
  );

  /** Обработчик для закрытия формы */
  const handleCloseForm = useCallback(() => {
    setShowNewsForm(null);
  }, []);

  return (
    <ErrorBoundary>
      <PageLayout
        title="Новости"
        actions={
          currentUser && (
            <IconButton
              icon="➕"
              variant="primary"
              size="md"
              onClick={() => setShowNewsForm('create')}
              ariaLabel="Добавить новость"
            />
          )
        }
      >
        {/* Панель фильтров и поиска */}
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
                  placeholder="Поиск новостей..."
                />
                <Dropdown
                  options={SORT_OPTIONS}
                  currentSort={sortKey}
                  onChange={setSortKey}
                />
              </>
            }
          />

          <NewsList
            news={news}
            currentUser={currentUser}
            toggleComments={onToggleComments}
            commentTarget={commentTarget}
            onCloseComments={handleCloseComments}
            onCommentChange={handleCommentChange}
            toggleLike={toggleLike}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            onVideoStart={setOnVideoStart}
            currentNews={newsVideo}
            isPlaying={Boolean(newsVideo)}
            updateViewsCount={incrementViewsCount}
            deleteNews={deleteNews}
            updateNews={setShowNewsForm}
            onPlayNews={handleOpenNewsVideo}
            hasMore={hasMore}
            loadMore={loadMore}
            onRetry={refetch}
          />
        </SectionCard>

        {/* Модальное окно с формой добавления/редактирования новости */}
        {showNewsForm && currentUser && (
          <NewsForm
            key={
              showNewsForm === 'create' ? 'create' : `edit-${showNewsForm.id}`
            }
            initialData={showNewsForm === 'create' ? null : showNewsForm}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
            currentUser={currentUser}
          />
        )}

        {/* Модальное окно с видео */}
        {newsVideo && (
          <VideoPlayer
            video={newsVideo}
            onClose={handleCloseVideo}
            onPlayStart={handleVideoPlayStart}
          />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
