import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCommentsPanel } from '../../../features/comments';
import { PostForm } from '../../../features/posts';
import { useUserContentFilter } from '../../../features/users';
import { SORT_OPTIONS } from '../../../shared/config';
import { useFilterControls } from '../../../shared/hooks';
import {
  Dropdown,
  ErrorBoundary,
  IconButton,
  PageLayout,
  PageLoader,
  SectionCard,
  Toolbar,
} from '../../../shared/ui';
import { useAudioPlayer } from '../../../widgets/audio-player';
import { CommentsSection } from '../../../widgets/comments-list';
import {
  PROFILE_TABS_MAP,
  getProfileTabContent,
} from '../../../widgets/user-content';
import { Profile } from '../../../widgets/user-profile';
import { VideoPlayer } from '../../../widgets/video-player';
import style from './ProfilePage.module.css';

/**
 * Страница профиля пользователя.
 * Отображает карточку пользователя, вкладки с контентом (посты, фото, треки, видео),
 * форму создания поста, комментарии и модальный видеоплеер.
 */

export const ProfilePage = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const commentsSectionRef = useRef(null);
  const onVideoStartRef = useRef(null);
  const { userId: userIdParam } = useParams();

  /** Управление фильтрацией и сортировкой */
  const {
    filter: activeTab,
    sortKey,
    setSortKey,
    handleFilterChange: setActiveTab,
  } = useFilterControls({
    initialFilter: 'posts',
    initialSort: 'dateDesc',
  });

  /**  Загрузка контента вкладки с экшенами */
  const {
    currentUser,
    targetUser,
    isOwnProfile,
    userError,
    refetchUser,
    followUser,
    unfollowUser,
    acceptUser,
    blockUser,
    unlockUser,
    items,
    isLoadingProfile,
    toggleLikeItem,
    deleteFromLibrary,
    addToLibrary,
    incrementCounter,
    toggleFavoriteItem,
    updateCommentCount,
    // Посты
    isLoadingPosts,
    isLoadingMorePosts,
    errorPosts,
    addPost,
    updatePost,
    deletePost,
    hasMorePosts,
    loadMorePosts,
    refetchPosts,
    // Треки
    isLoadingTracks,
    isLoadingMoreTracks,
    errorTracks,
    hasMoreTracks,
    loadMoreTracks,
    refetchTracks,
    // Видео
    isLoadingVideos,
    isLoadingMoreVideos,
    errorVideos,
    hasMoreVideos,
    loadMoreVideos,
    refetchVideos,
  } = useUserContentFilter({
    activeTab,
    sortKey,
    userIdParam,
  });

  // Экшены для управления аудиоплеером + состояние аудиоплеера
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /** Обработчик для открытия модального окна с видео*/
  const handleOpenVideo = useCallback((video) => {
    if (!video) return;
    setSelectedVideo(video);
  }, []);

  /** Колбэк для запуска видео*/
  const setOnVideoStart = useCallback((handler) => {
    onVideoStartRef.current = handler;
  }, []);

  /** Обработчик для запуска видео*/
  const handleVideoPlayStart = useCallback((video) => {
    onVideoStartRef.current?.(video);
  }, []);

  /** Обработчик для закрытия модального окна с видео*/
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  // Управление панелью комментариев (панель закрывается при изменении страницы или вкладки)
  const commentTargetType = activeTab === 'photos' ? 'posts' : activeTab;
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel(commentTargetType, sortKey, activeTab);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => {
      updateCommentCount(commentTarget?.id, delta);
    },
    [commentTarget?.id, updateCommentCount]
  );

  /** Обработчик для отправки формы добавления/редактирования поста*/
  const handleFormSubmit = useCallback(
    async (values, isEdit, postId) => {
      if (isEdit && postId) {
        await updatePost?.(postId, values);
      } else {
        await addPost?.(values);
      }
      setShowPostForm(null);
    },
    [addPost, updatePost]
  );

  /** Обработчик для закрытия формы добавления/редактирования поста*/
  const handleCloseForm = useCallback(() => {
    setShowPostForm(null);
  }, []);

  /** Скролл к секции комментариев при открытии панели */
  useEffect(() => {
    if (!commentTarget?.id || !commentTarget?.type) return;
    commentsSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [commentTarget?.id, commentTarget?.type]);

  /**  Состояние загрузки всей страницы */
  if (isLoadingProfile || (userIdParam && !targetUser)) {
    return <PageLoader message="Загружаем профиль..." />;
  }

  /** Контекст для getProfileTabContent */
  const tabContext = {
    currentUser,
    targetUser,
    toggleComments: onToggleComments,
    isOwnProfile,
    toggleLike: toggleLikeItem,
    items,
    ...(activeTab === 'posts' && {
      isLoading: isLoadingPosts,
      isLoadingMore: isLoadingMorePosts,
      error: errorPosts,
      onPlayPost: handleOpenVideo,
      currentPost: selectedVideo,
      isPlaying: Boolean(selectedVideo),
      deletePost,
      updatePost: setShowPostForm,
      hasMore: hasMorePosts,
      loadMore: loadMorePosts,
      refetch: refetchPosts,
    }),
    ...(activeTab === 'photos' && {
      isLoading: isLoadingPosts,
      isLoadingMore: isLoadingMorePosts,
      error: errorPosts,
      deletePhoto: deletePost,
      hasMore: hasMorePosts,
      loadMore: loadMorePosts,
      refetch: refetchPosts,
    }),
    ...(activeTab === 'tracks' && {
      isLoading: isLoadingTracks,
      isLoadingMore: isLoadingMoreTracks,
      error: errorTracks,
      mode: 'profile',
      currentTrack,
      isPlaying,
      onPlay: playTrack,
      onTrackStart: setOnTrackStart,
      togglePlay,
      addOptimistic: addToLibrary,
      deleteOptimistic: deleteFromLibrary,
      updatePlaysCount: incrementCounter,
      toggleFavorite: toggleFavoriteItem,
      hasMore: hasMoreTracks,
      loadMore: loadMoreTracks,
      refetch: refetchTracks,
    }),
    ...(activeTab === 'videos' && {
      isLoading: isLoadingVideos,
      isLoadingMore: isLoadingMoreVideos,
      error: errorVideos,
      mode: 'profile',
      onPlayVideo: handleOpenVideo,
      onVideoStart: setOnVideoStart,
      currentVideo: selectedVideo,
      isPlaying: Boolean(selectedVideo),
      addToLibrary: addToLibrary,
      deleteFromLibrary: deleteFromLibrary,
      updateLibraryViewsCount: incrementCounter,
      toggleFavorite: toggleFavoriteItem,
      hasMore: hasMoreVideos,
      loadMore: loadMoreVideos,
      refetch: refetchVideos,
    }),
  };

  /** Получение контента вкладки */
  const tabContent = getProfileTabContent({ activeTab, tabProps: tabContext });

  return (
    <ErrorBoundary>
      <PageLayout className={style.profile}>
        {/* Карточка профиля */}
        <Profile
          targetUser={targetUser}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          error={userError}
          refetchUser={refetchUser}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          onAccept={acceptUser}
          onUnlock={unlockUser}
          onBlock={blockUser}
        />

        {/* Вкладки с контентом */}
        <SectionCard>
          <Toolbar
            tabs={PROFILE_TABS_MAP}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            rightSlot={
              <>
                {/* Сортировка */}
                <Dropdown
                  options={SORT_OPTIONS}
                  currentSort={sortKey}
                  onChange={setSortKey}
                />
                {/* Кнопка для добавления поста */}
                {isOwnProfile && activeTab === 'posts' && (
                  <IconButton
                    icon="➕"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPostForm('create')}
                    aria-label="Добавить пост"
                  />
                )}
              </>
            }
          />

          {/* Форма для добавления/редактирования поста */}
          {showPostForm && currentUser && (
            <PostForm
              key={
                showPostForm === 'create' ? 'create' : `edit-${showPostForm.id}`
              }
              initialData={showPostForm === 'create' ? null : showPostForm}
              onClose={handleCloseForm}
              onSubmit={handleFormSubmit}
            />
          )}

          {/* Контент вкладки */}
          {tabContent}
        </SectionCard>

        {/* Комментарии */}
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

        {/* Видеоплеер */}
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
