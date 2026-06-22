import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import style from './ProfilePage.module.css';
import { VideoPlayer } from '../../../widgets/video-player';
import { CommentsSection } from '../../../widgets/comments-list';
import { useAudioPlayer } from '../../../widgets/audio-player';
import { UserProfileCard } from '../../../widgets/user-profile';
import { UserContentTabs } from '../../../widgets/user-content/ui/UserContentTabs';
import { PostForm } from '../../../features/posts';
import { useUserContentFilter, useOnline } from '../../../features/users';
import { useFriendshipStatus } from '../../../features/friends';
import { useCommentsPanel } from '../../../features/comments';
import { Loading, FilterButton, SortDropdown } from '../../../shared/ui';
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

  /**
   * Получение статуса пользователя в сети/не в сети
   * @param {number} targetUser.id - ID пользователя
   */
  const onlineMap = useOnline(targetUser?.id);
  const userOnline = onlineMap.get(targetUser?.id) ?? false;

  /**
   * Получение статуса дружбы
   * @param {number} targetUser.id - ID пользователя которого смотрим
   * @param {number} currentUser.id - ID текущего пользователя
   */
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

  const pagination = useCallback(() => {
    if (activeTab === 'Post' || activeTab === 'Photo') return paginationPosts;
    else if (activeTab === 'Music') return paginationTracks;
    else if (activeTab === 'Video') return paginationVideos;
  }, [activeTab, paginationPosts, paginationTracks, paginationVideos]);

  const commentTargetType = activeTab === 'Photo' ? 'Post' : activeTab;
  const { commentTarget, handleCloseComments, onToggleComments } = useCommentsPanel(
    commentTargetType,
    pagination()?.currentPage
  );

  /** Экшены для управления аудиоплеером */
  const { playTrack, setOnTrackStart, isPlaying, currentTrack, togglePlay } = useAudioPlayer();

  const handleCommentChange = useCallback(
    (delta) => {
      if (activeTab === 'Post' || activeTab === 'Photo')
        updateCommentCountPost(commentTarget.id, delta);
      else if (activeTab === 'Music') updateCommentCountTrack(commentTarget.id, delta);
      else if (activeTab === 'Video') updateCommentCountVideo(commentTarget.id, delta);
    },
    [
      activeTab,
      commentTarget?.id,
      updateCommentCountPost,
      updateCommentCountTrack,
      updateCommentCountVideo,
    ]
  );

  // Открыть/закрыть модальное окно с видео
  const handleClickVideo = useCallback((video) => setSelectedVideo(video), []);
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  /**  Категории вкладок (должны совпадать с ключами activeTab) */
  const CATEGORIES = [
    { id: 'Post', name: 'Посты' },
    { id: 'Photo', name: 'Фото' },
    { id: 'Music', name: 'Треки' },
    { id: 'Video', name: 'Видео' },
  ];

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
    return <Loading fullPage message="Загружаем профиль..." size="large" />;
  }

  return (
    <div className={style.profile}>
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
      <div className={style.contentArea}>
        <div className={style.tabsRow}>
          <div className={style.filterButtons}>
            {CATEGORIES.map((cat) => (
              <FilterButton
                key={cat.id}
                cat={cat}
                filter={activeTab}
                onChangeButtonFilter={(id) => {
                  setActiveTab(id);
                  setSortKey('dateDesc');
                }}
              />
            ))}
          </div>
          <div className={style.rightControls}>
            <SortDropdown options={SORT_OPTIONS} currentSort={sortKey} onChange={setSortKey} />

            {/* Кнопка добавления поста видна только на своей странице и при активной вкладке "Post" */}
            {currentUser?.id === targetUser?.id && activeTab === 'Post' && (
              <button
                className={style.addButton}
                onClick={() => setShowPostForm((prev) => !prev)}
                aria-label={showPostForm ? 'Скрыть форму' : 'Добавить пост'}
              >
                ➕
              </button>
            )}
          </div>
        </div>

        {/* Форма создания поста */}
        {showPostForm && currentUser && (
          <PostForm
            currentUser={currentUser}
            isLoading={isLoadingPosts}
            onAddPost={handleAddPost}
            onClose={setShowPostForm}
            errorPosts={errorPosts}
          />
        )}

        {/* Контент выбранной вкладки */}
        <div className={style.tabContent}>{renderContent}</div>
      </div>

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
      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />}
    </div>
  );
};
