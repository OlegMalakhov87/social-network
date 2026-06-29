import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import style from './ProfilePage.module.css';
import { VideoPlayer } from '../../../widgets/video-player';
import { CommentsSection } from '../../../widgets/comments-list';
import { useAudioPlayer } from '../../../widgets/audio-player';
import { UserProfileCard } from '../../../widgets/user-profile';
import { UserContentTabs } from '../../../widgets/user-content/ui/UserContentTabs';
import { PostForm } from '../../../features/posts';
import {
  useUserContentFilter,
  useOnline,
  ProfileTabs,
} from '../../../features/users';
import { useFriendshipStatus } from '../../../features/friends';
import { useCommentsPanel } from '../../../features/comments';
import { PROFILE_TABS } from '../../../entities/user';
import {
  PageLoader,
  Dropdown,
  Button,
  PageLayout,
  SectionCard,
} from '../../../shared/ui';
import { SORT_OPTIONS } from '../../../shared/config/sortConfig';

/**
 * Страница профиля пользователя.
 * Отображает карточку пользователя, вкладки с контентом (посты, фото, треки, видео),
 * форму создания поста, комментарии и модальный видеоплеер.
 */
export const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('Post');
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
    // Посты
    isLoadingProfile,
    isLoadingPosts,
    paginationPosts,
    errorPosts,
    toggleLikePost,
    handleAddPost,
    handleDeletePost,
    updateCommentCountPost,
    // Треки
    isLoadingTracks,
    paginationTracks,
    errorTracks,
    toggleLikeTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    updatePlayCount,
    toggleFavoriteTrack,
    updateCommentCountTrack,
    // Видео
    isLoadingVideos,
    paginationVideos,
    errorVideos,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateViewCount,
    toggleFavoriteVideo,
    updateCommentCountVideo,
  } = useUserContentFilter({
    activeTab,
    sortKey,
    userIdParam,
  });

  /** Получение статуса пользователя (в сети или нет) */
  const onlineMap = useOnline(targetUser?.id);
  const userOnline = onlineMap.get(targetUser?.id) ?? false;

  // Получение статуса дружбы
  const {
    status: friendshipStatus,
    direction: friendshipDirection,
    friendshipId,
    follow,
    unfollow,
    accept,
    block,
    unlock,
  } = useFriendshipStatus({
    targetUserId: targetUser?.id,
    currentUserId: currentUser?.id,
  });

  /** Момоизированная пагинация открытой вкладки */
  const currentPagination = useMemo(() => {
    switch (activeTab) {
      case 'Post':
      case 'Photo':
        return paginationPosts;

      case 'Music':
        return paginationTracks;

      case 'Video':
        return paginationVideos;

      default:
        return null;
    }
  }, [activeTab, paginationPosts, paginationTracks, paginationVideos]);

  // Управление панелью комментариев (панель закрывается при изменении страницы или вкладки)
  const commentTargetType = activeTab === 'Photo' ? 'Post' : activeTab;
  const { commentTarget, handleCloseComments, onToggleComments } =
    useCommentsPanel(commentTargetType, currentPagination?.currentPage);

  /** Обработчик для подсчета количеста комментариев */
  const handleCommentChange = useCallback(
    (delta) => {
      if (activeTab === 'Post' || activeTab === 'Photo')
        updateCommentCountPost(commentTarget.id, delta);
      else if (activeTab === 'Music')
        updateCommentCountTrack(commentTarget.id, delta);
      else if (activeTab === 'Video')
        updateCommentCountVideo(commentTarget.id, delta);
    },
    [
      activeTab,
      commentTarget?.id,
      updateCommentCountPost,
      updateCommentCountTrack,
      updateCommentCountVideo,
    ]
  );

  // Экшены для управления аудиоплеером
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } =
    useAudioPlayer();

  /** Обработчик для открытия модального окна с видео*/
  const handleClickVideo = useCallback((video) => setSelectedVideo(video), []);
  /** Обработчик для закрытия модального окна с видео*/
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  /**  Мемоизированный рендер выбранной вкладки */
  const renderContent = useMemo(() => {
    const commonProps = {
      currentUser,
      targetUser,
      items,
      onToggleComments,
    };

    switch (activeTab) {
      case 'Post':
        return (
          <UserContentTabs.Posts
            {...commonProps}
            isProfileOwner={currentUser?.id === targetUser?.id}
            onClickVideo={handleClickVideo}
            toggleLikePost={toggleLikePost}
            onAddPost={handleAddPost}
            onDeletePost={handleDeletePost}
            isLoadingPosts={isLoadingPosts}
            errorPosts={errorPosts}
          />
        );
      case 'Photo':
        return (
          <UserContentTabs.Photos
            {...commonProps}
            isProfileOwner={currentUser?.id === targetUser?.id}
            toggleLikePhoto={toggleLikePost}
            onDeletePhoto={handleDeletePost}
            isLoadingPhoto={isLoadingPosts}
            errorPosts={errorPosts}
          />
        );
      case 'Music':
        return (
          <UserContentTabs.Tracks
            {...commonProps}
            mode="profile"
            isProfileOwner={currentUser?.id === targetUser?.id}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayTrack={playTrack}
            togglePlay={togglePlay}
            onTrackStart={setOnTrackStart}
            isLoadingTracks={isLoadingTracks}
            errorTracks={errorTracks}
            onAddToLibrary={addTrackOptimistic}
            onRemoveFromLibrary={removeTrackOptimistic}
            toggleLikeTrack={toggleLikeTrack}
            updatePlayCount={updatePlayCount}
            toggleFavoriteTrack={toggleFavoriteTrack}
          />
        );
      case 'Video':
        return (
          <UserContentTabs.Videos
            {...commonProps}
            mode="profile"
            isProfileOwner={currentUser?.id === targetUser?.id}
            onClickVideo={handleClickVideo}
            toggleLikeVideo={toggleLikeVideo}
            isLoadingVideos={isLoadingVideos}
            errorVideos={errorVideos}
            onAddToLibrary={addVideoOptimistic}
            onRemoveFromLibrary={removeVideoOptimistic}
            updateViewCount={updateViewCount}
            toggleFavoriteVideo={toggleFavoriteVideo}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    items,
    currentUser,
    targetUser,
    // Посты
    isLoadingPosts,
    errorPosts,
    toggleLikePost,
    handleAddPost,
    handleDeletePost,
    // Треки
    isLoadingTracks,
    errorTracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setOnTrackStart,
    toggleLikeTrack,
    updatePlayCount,
    toggleFavoriteTrack,
    addTrackOptimistic,
    removeTrackOptimistic,
    // Видео
    isLoadingVideos,
    errorVideos,
    toggleLikeVideo,
    addVideoOptimistic,
    removeVideoOptimistic,
    updateViewCount,
    toggleFavoriteVideo,
    handleClickVideo,
    // Коментарии
    onToggleComments,
  ]);

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
        onFollow={follow}
        onUnfollow={unfollow}
        onAccept={accept}
        onUnlock={unlock}
        onBlock={block}
        friendshipStatus={friendshipStatus}
        friendshipDirection={friendshipDirection}
        friendshipId={friendshipId}
        userError={userError}
        userOnline={userOnline}
      />

      {/* Вкладки с контентом */}
      <SectionCard className={style.contentArea}>
        <div className={style.tabsRow}>
          <div className={style.filterButtons}>
            <ProfileTabs
              tabs={PROFILE_TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          <div className={style.rightControls}>
            {/* Кнопка сортировки контента по дате и поппулярности */}
            <Dropdown
              options={SORT_OPTIONS}
              currentSort={sortKey}
              onChange={setSortKey}
            />
            {/* Кнопка добавления поста видна только на своей странице и при активной вкладке "Post" */}
            {currentUser?.id === targetUser?.id && activeTab === 'Post' && (
              <Button
                variant="primary"
                size="small"
                onClick={() => setShowPostForm((prev) => !prev)}
                aria-label={showPostForm ? 'Скрыть форму' : 'Добавить пост'}
              >
                Добавить пост
              </Button>
            )}
          </div>
        </div>

        {/* Форма создания поста */}
        {showPostForm && currentUser && (
          <PostForm
            currentUser={currentUser}
            isLoading={isLoadingPosts}
            onAddPost={handleAddPost}
            onClose={() => setShowPostForm(false)}
            errorPosts={errorPosts}
          />
        )}

        {/* Контент выбранной вкладки */}
        <div>{renderContent}</div>
      </SectionCard>

      {/* Панель комментариев */}
      {commentTarget && currentUser && (
        <CommentsSection
          targetType={commentTarget?.type}
          targetId={commentTarget?.id}
          currentUser={currentUser}
          updateCommentCount={handleCommentChange}
          closeComments={handleCloseComments}
        />
      )}

      {/* Модальный видеоплеер */}
      {selectedVideo && (
        <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />
      )}
    </PageLayout>
  );
};
