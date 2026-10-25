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
 * Отображает страницу новостей.
 *
 * @returns {JSX.Element} Разметка страницы.
 */
export const NewsPage = () => {
  const [showNewsForm, setShowNewsForm] = useState(null);
  const [newsVideo, setNewsVideo] = useState(null);
  const onVideoStartRef = useRef(null);

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

  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('news', sortKey, filter, currentPage);

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
   * Открывает видео новости в плеере.
   *
   * @param {Object|Function} video - Данные видео или обработчик
   * @returns {void}
   */
  const handleOpenNewsVideo = useCallback((video) => {
    if (!video || typeof video === 'function') return;
    setNewsVideo(video);
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

  const handleCloseVideo = useCallback(() => setNewsVideo(null), []);

  /**
   * Отправляет форму новости.
   *
   * @param {Object} values - Данные формы
   * @param {boolean} isEdit - Признак редактирования
   * @param {number|undefined} newsId - Идентификатор новости
   * @returns {Promise<void>}
   */
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
