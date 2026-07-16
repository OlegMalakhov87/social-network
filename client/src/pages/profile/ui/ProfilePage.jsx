import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PROFILE_TABS_MAP, getProfileTabContent } from '../../../entities/user';
import { useCommentsPanel } from '../../../features/comments';
import { useFriendshipStatus } from '../../../features/friends';
import { PostForm } from '../../../features/posts';
import { useOnline, useUserContentFilter } from '../../../features/users';
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
import { UserProfileCard } from '../../../widgets/user-profile';
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
    items,
    isLoadingProfile,
    toggleLikeItem,
    deleteItemOptimistic,
    addItemOptimistic,
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

  /** Получение статуса пользователя (в сети или нет) */
  const onlineMap = useOnline(targetUser?.id);
  const userOnline = onlineMap.get(targetUser?.id) ?? false;

  // Получение статуса дружбы с текущим пользователем + экшены для управления статусом дружбы
  const {
    status: friendshipStatus,
    direction: friendshipDirection,
    friendshipId,
    followUser,
    unfollowUser,
    acceptUser,
    blockUser,
    unlockUser,
  } = useFriendshipStatus({
    targetUserId: targetUser?.id,
    currentUserId: currentUser?.id,
  });

  // Экшены для управления аудиоплеером + состояние аудиоплеера
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /** Обработчик для открытия модального окна с видео*/
  const handleOpenVideo = useCallback((video) => setSelectedVideo(video), []);
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

  /** Обработчик для отправки формы */
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

  /** Обработчик для закрытия формы */
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

  /**  Получение пропсов для выбранной вкладки */
  const tab = PROFILE_TABS_MAP.find(({ id }) => id === activeTab);
  if (!tab) return null;

  const tabProps = tab?.getProps({
    currentUser,
    targetUser,
    toggleComments: onToggleComments,
    isOwnProfile,
    toggleLike: toggleLikeItem,
    posts: {
      items,
      isLoading: isLoadingPosts,
      isLoadingMore: isLoadingMorePosts,
      error: errorPosts,
      onPlayVideo: handleOpenVideo,
      deletePost: deletePost,
      updatePost: setShowPostForm,
      hasMore: hasMorePosts,
      loadMore: loadMorePosts,
      refetch: refetchPosts,
    },
    tracks: {
      items,
      isLoading: isLoadingTracks,
      isLoadingMore: isLoadingMoreTracks,
      error: errorTracks,
      mode: 'profile',
      currentTrack: currentTrack,
      isPlaying: isPlaying,
      onPlay: playTrack,
      onTrackStart: setOnTrackStart,
      togglePlay: togglePlay,
      addOptimistic: addItemOptimistic,
      removeOptimistic: deleteItemOptimistic,
      updatePlayCount: incrementCounter,
      toggleFavorite: toggleFavoriteItem,
      hasMore: hasMoreTracks,
      loadMore: loadMoreTracks,
      refetch: refetchTracks,
    },
    videos: {
      items,
      isLoading: isLoadingVideos,
      isLoadingMore: isLoadingMoreVideos,
      error: errorVideos,
      mode: 'profile',
      onPlayVideo: handleOpenVideo,
      addOptimistic: addItemOptimistic,
      removeOptimistic: deleteItemOptimistic,
      updateViewCount: incrementCounter,
      toggleFavorite: toggleFavoriteItem,
      hasMore: hasMoreVideos,
      loadMore: loadMoreVideos,
      refetch: refetchVideos,
    },
    photos: {
      items,
      isLoading: isLoadingPosts,
      isLoadingMore: isLoadingMorePosts,
      error: errorPosts,
      deletePhoto: deletePost,
      hasMore: hasMorePosts,
      loadMore: loadMorePosts,
      refetch: refetchPosts,
    },
  });

  /**  Рендер выбранной вкладки */
  const tabContent = getProfileTabContent({ activeTab, tabProps });

  return (
    <ErrorBoundary>
      <PageLayout className={style.profile}>
        {/* Карточка профиля */}
        <UserProfileCard
          targetUser={targetUser}
          currentUser={currentUser}
          isOwnProfile={isOwnProfile}
          onFollow={followUser}
          onUnfollow={unfollowUser}
          onAccept={acceptUser}
          onUnlock={unlockUser}
          onBlock={blockUser}
          friendshipStatus={friendshipStatus}
          friendshipDirection={friendshipDirection}
          friendshipId={friendshipId}
          error={userError}
          online={userOnline}
        />

        {/* Вкладки с контентом */}
        <SectionCard>
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
                    aria-label="Добавить пост"
                  />
                )}
              </>
            }
          />

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

          {tabContent}
        </SectionCard>

        {commentTarget && currentUser && (
          <CommentsSection
            targetType={commentTarget?.type}
            targetId={commentTarget?.id}
            currentUser={currentUser}
            updateCommentCount={handleCommentChange}
            closeComments={handleCloseComments}
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
