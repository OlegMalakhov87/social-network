import { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useCommentsPanel } from '../../../features/comments';
import { PostForm } from '../../../features/posts';
import { useContentFilter } from '../../../features/users';
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
import {
  PROFILE_TABS_MAP,
  getProfileTabContent,
} from '../../../widgets/user-content';
import { Profile } from '../../../widgets/user-profile';
import { VideoPlayer } from '../../../widgets/video-player';

import style from './ProfilePage.module.css';

/**
 * Отображает страницу профиля.
 *
 * @returns {JSX.Element} Разметка страницы.
 */
export const ProfilePage = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const onVideoStartRef = useRef(null);
  const { userId: userIdParam } = useParams();

  const {
    filter: activeTab,
    sortKey,
    setSortKey,
    handleFilterChange: setActiveTab,
  } = useFilterControls({
    initialFilter: 'posts',
    initialSort: 'dateDesc',
  });

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
    updateCommentsCount,
    isLoadingPosts,
    isLoadingMorePosts,
    errorPosts,
    addPost,
    updatePost,
    deletePost,
    hasMorePosts,
    currentPagePosts,
    loadMorePosts,
    refetchPosts,
    isLoadingTracks,
    isLoadingMoreTracks,
    errorTracks,
    hasMoreTracks,
    currentPageTracks,
    loadMoreTracks,
    refetchTracks,
    isLoadingVideos,
    isLoadingMoreVideos,
    errorVideos,
    hasMoreVideos,
    currentPageVideos,
    loadMoreVideos,
    refetchVideos,
  } = useContentFilter({
    activeTab,
    sortKey,
    userIdParam,
  });

  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /**
   * Открывает видео в плеере.
   *
   * @param {Object} video - Данные видео
   * @returns {void}
   */
  const handleOpenVideo = useCallback((video) => {
    if (!video) return;
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

  // Сопоставляет фото с комментариями постов.
  const commentTargetType = activeTab === 'photos' ? 'posts' : activeTab;

  const PAGE_BY_TAB = {
    posts: currentPagePosts,
    tracks: currentPageTracks,
    videos: currentPageVideos,
  };

  const currentPage = PAGE_BY_TAB[commentTargetType] ?? 1;

  // Закрывает панель при смене страницы или вкладки.
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel(commentTargetType, userIdParam, sortKey, currentPage);

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
   * Отправляет форму поста.
   *
   * @param {Object} values - Данные формы
   * @param {boolean} isEdit - Признак редактирования
   * @param {number|undefined} postId - Идентификатор поста
   * @returns {Promise<void>}
   */
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

  const handleCloseForm = useCallback(() => {
    setShowPostForm(null);
  }, []);

  if (isLoadingProfile || (userIdParam && !targetUser && !userError)) {
    return <PageLoader message="Загружаем профиль..." />;
  }

  const tabContext = {
    currentUser,
    targetUser,
    toggleComments: onToggleComments,
    commentTarget,
    onCloseComments: handleCloseComments,
    onCommentChange: handleCommentChange,
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

  const tabContent = getProfileTabContent({ activeTab, tabProps: tabContext });

  return (
    <ErrorBoundary>
      <PageLayout className={style.profile}>
        <SectionCard>
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

          <Toolbar
            tabs={PROFILE_TABS_MAP}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            rightSlot={
              <>
                <Dropdown
                  options={SORT_OPTIONS}
                  currentSort={sortKey}
                  onChange={setSortKey}
                />
                {isOwnProfile && activeTab === 'posts' && (
                  <IconButton
                    icon="➕"
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPostForm('create')}
                    ariaLabel="Добавить пост"
                  />
                )}
              </>
            }
          />

          {tabContent}
        </SectionCard>

        {showPostForm && currentUser && (
          <PostForm
            key={
              showPostForm === 'create' ? 'create' : `edit-${showPostForm.id}`
            }
            initialData={showPostForm === 'create' ? null : showPostForm}
            onClose={handleCloseForm}
            onSubmit={handleFormSubmit}
            currentUser={currentUser}
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
