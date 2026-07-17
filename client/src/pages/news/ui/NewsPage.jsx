import { useCallback, useEffect, useRef, useState } from 'react';
import { NEWS_TABS_MAP } from '../../../entities/news';
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
import { CommentsSection } from '../../../widgets/comments-list';
import { NewsGrid } from '../../../widgets/news-list';
import { VideoPlayer } from '../../../widgets/video-player';

/**
 * Страница новостей – отображает каталог новостей с фильтрацией, поиском и сортировкой.
 */

export const NewsPage = () => {
  const [showNewsForm, setShowNewsForm] = useState(null);
  const [newsVideo, setNewsVideo] = useState(null);
  const commentsSectionRef = useRef(null);

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
    error,
    loadMore,
    refetch,
    addNews,
    deleteNews,
    updateNews,
    toggleLike,
    incrementViewCount,
    updateCommentCount,
  } = useNews({
    filter,
    searchQuery,
    sortKey,
  });

  // Управление панелью комментариев (панель закрывается при изменении страницы или вкладки)
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel('news', sortKey, filter);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => updateCommentCount(commentTarget?.id, delta),
    [commentTarget?.id, updateCommentCount]
  );

  /** Обработчик для открытия модального окна с видео*/
  const handleOpenVideo = useCallback((video) => setNewsVideo(video), []);
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
            tabs={NEWS_TABS_MAP}
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

          {showNewsForm && currentUser && (
            <NewsForm
              key={
                showNewsForm === 'create' ? 'create' : `edit-${showNewsForm.id}`
              }
              initialData={showNewsForm === 'create' ? null : showNewsForm}
              userName={currentUser?.name}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
            />
          )}
          <NewsGrid
            news={news}
            currentUser={currentUser}
            hasMore={hasMore}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            error={error}
            loadMore={loadMore}
            onPlayVideo={handleOpenVideo}
            toggleLike={toggleLike}
            onReadMore={incrementViewCount}
            toggleComments={onToggleComments}
            deleteNews={deleteNews}
            updateNews={setShowNewsForm}
            onRetry={refetch}
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
        {newsVideo && (
          <VideoPlayer video={newsVideo} onClose={handleCloseVideo} />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
