import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PROFILE_TABS_MAP, getProfileTabContent } from '../../../entities/user';
import { useCommentsPanel } from '../../../features/comments';
import { useFriendshipStatus } from '../../../features/friends';
import { PostForm } from '../../../features/posts';
import { useOnline, useUserContentFilter } from '../../../features/users';
import { SORT_OPTIONS } from '../../../shared/config';
import {
  Button,
  Dropdown,
  PageLayout,
  PageLoader,
  ProfileToolbar,
  SectionCard,
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
  const [activeTab, setActiveTab] = useState('posts');
  const [sortKey, setSortKey] = useState('dateDesc');
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const { userId: userIdParam } = useParams();

  /**  Загрузка контента вкладки с экшенами */
  const {
    currentUser,
    targetUser,
    userError,
    items,
    isLoadingProfile,
    toggleLikeItem,
    removeItemOptimistic,
    addItemOptimistic,
    updateItemCount,
    toggleFavorite,
    updateCommentCount,
    // Посты
    isLoadingPosts,
    paginationPosts,
    errorPosts,
    handleAddPost,
    handleDeletePost,
    handleEditPost,
    // Треки
    isLoadingTracks,
    paginationTracks,
    errorTracks,
    // Видео
    isLoadingVideos,
    paginationVideos,
    errorVideos,
  } = useUserContentFilter({
    activeTab,
    sortKey,
    userIdParam,
  });
  /** Проверка, является ли текущий пользователь владельцем профиля */
  const isProfileOwner = currentUser?.id === targetUser?.id;

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
  const handleClickVideo = useCallback((video) => setSelectedVideo(video), []);
  /** Обработчик для закрытия модального окна с видео*/
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  /** Получение текущей пагинации открытой вкладки */
  const currentPagination = {
    posts: paginationPosts,
    photos: paginationPosts,
    tracks: paginationTracks,
    videos: paginationVideos,
  }[activeTab];

  // Управление панелью комментариев (панель закрывается при изменении страницы или вкладки)
  const commentTargetType = activeTab === 'photos' ? 'posts' : activeTab;
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel(commentTargetType, currentPagination?.currentPage);

  /** Получение функции для обновления количества комментариев открытой вкладки */
  const handleCommentChange = useCallback(
    (delta) => {
      updateCommentCount(commentTarget?.id, delta);
    },
    [commentTarget?.id, updateCommentCount]
  );

  /**  Получение пропсов для выбранной вкладки */
  const tab = PROFILE_TABS_MAP.find(({ id }) => id === activeTab);
  if (!tab) return null;

  /**  Получение пропсов для выбранной вкладки */
  const tabProps = tab?.getProps({
    currentUser,
    targetUser,
    toggleComments: onToggleComments,
    isProfileOwner,
    toggleLike: toggleLikeItem,
    posts: {
      items,
      isLoading: isLoadingPosts,
      error: errorPosts,
      onPlayVideo: handleClickVideo,
      deletePost: handleDeletePost,
      editPost: handleEditPost,
    },
    tracks: {
      items,
      isLoading: isLoadingTracks,
      error: errorTracks,
      mode: 'profile',
      currentTrack: currentTrack,
      isPlaying: isPlaying,
      onPlay: playTrack,
      onTrackStart: setOnTrackStart,
      togglePlay: togglePlay,
      addOptimistic: addItemOptimistic,
      removeOptimistic: removeItemOptimistic,
      updatePlayCount: updateItemCount,
      toggleFavorite: toggleFavorite,
    },
    videos: {
      items,
      isLoading: isLoadingVideos,
      error: errorVideos,
      mode: 'profile',
      onPlayVideo: handleClickVideo,
      addOptimistic: addItemOptimistic,
      removeOptimistic: removeItemOptimistic,
      updateViewCount: updateItemCount,
      toggleFavorite: toggleFavorite,
    },
    photos: {
      items,
      isLoading: isLoadingPosts,
      error: errorPosts,
      deletePhoto: handleDeletePost,
    },
  });

  /**  Рендер выбранной вкладки */
  const tabContent = getProfileTabContent({ activeTab, tabProps });

  /**  Состояние загрузки всей страницы */
  if (isLoadingProfile || (userIdParam && !targetUser)) {
    return <PageLoader message="Загружаем профиль..." />;
  }

  return (
    <PageLayout className={style.profile}>
      {/* Карточка профиля */}
      <UserProfileCard
        targetUser={targetUser}
        currentUser={currentUser}
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
        <ProfileToolbar
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

              {isProfileOwner && activeTab === 'posts' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowPostForm((prev) => !prev)}
                  aria-label={showPostForm ? 'Скрыть форму' : 'Добавить пост'}
                >
                  Добавить пост
                </Button>
              )}
            </>
          }
        />

        {showPostForm && currentUser && (
          <PostForm
            isLoading={isLoadingPosts}
            onAddPost={handleAddPost}
            onClose={() => setShowPostForm(false)}
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
        />
      )}

      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />
      )}
    </PageLayout>
  );
};
