import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import style from './DialogsPage.module.css';
import { DialogsGrid, ChatGrid } from '../../../widgets/dialogs-list';
import { VideoPlayer } from '../../../widgets/video-player';
import { useDialogsActions, useDialogs, useMessages } from '../../../features/dialogs';
import { useUserProfile, useOnline } from '../../../features/users';
import { SearchInput, Loading } from '../../../shared/ui';

/**
 * Страница диалогов (мессенджер).
 * Слева список диалогов, справа — переписка с выбранным пользователем.
 * На мобильных устройствах диалоги и чат переключаются.
 */
export const DialogsPage = () => {
  const { userId: userParam } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileDialogs, setShowMobileDialogs] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const currentUserId = useSelector((state) => state.auth.user?.id);

  const sharedPostId = sessionStorage.getItem('sharedPostId');

  // Загрузка диалогов
  const { dialogs, isLoading: dialogsLoading, refetch: refetchDialogs } = useDialogs(searchQuery);

  // Загрузка сообщений с выбранным пользователем
  const {
    messages,
    isLoading: messagesLoading,
    addOptimistic,
    replaceOptimistic,
    removeOptimistic,
    updateMessageInState,
    markAsRead,
    refetch: refetchMessages,
  } = useMessages(selectedUser?.id);

  // Действия
  const { sendMessage, deleteMessage, editMessage, sendSharedPost, clearChat } = useDialogsActions(
    sharedPostId,
    addOptimistic,
    replaceOptimistic,
    removeOptimistic,
    updateMessageInState,
    refetchDialogs,
    refetchMessages
  );

  // Загружаем пользователя по ID, если его нет в диалогах (новый чат)
  const { user: loadedUser, isLoading: userLoading } = useUserProfile(
    userParam && !selectedUser ? Number(userParam) : null
  );

  // Онлайн статус пользователя в сети
  const onlineMap = useOnline(selectedUser?.id);
  const partnerOnline = onlineMap.get(selectedUser?.id) ?? false;

  // При изменении userId из URL выбираем пользователя из диалогов
  useEffect(() => {
    if (!userParam) {
      setSelectedUser(null);
      setShowMobileDialogs(true);
      return;
    }
    if (dialogsLoading) return;
    const found = dialogs.find((d) => d.user.id === Number(userParam))?.user;
    if (found) {
      setSelectedUser(found);
      setShowMobileDialogs(false);
      return;
    }
    if (loadedUser) {
      setSelectedUser(loadedUser);
      setShowMobileDialogs(false);
    }
  }, [userParam, dialogs, dialogsLoading, loadedUser]);

  useEffect(() => {
    if (selectedUser && sharedPostId) {
      sendSharedPost(selectedUser.id);
    }
  }, [selectedUser, sharedPostId, sendSharedPost]);

  /**
   * Выбор собеседника из списка диалогов.
   * @param {Object} user - выбранный пользователь
   */
  const handleSelect = useCallback(
    (user) => {
      if (!user?.id) return;
      setSelectedUser(user);
      navigate(`/messages/${user.id}`);
      setShowMobileDialogs(false);
      setSearchQuery('');
    },
    [navigate]
  );

  /** Возврат к списку диалогов на мобильных */
  const handleBack = useCallback(() => {
    setShowMobileDialogs(true);
    navigate('/messages');
  }, [navigate]);

  // Открыть/закрыть модальное окно с видео
  const handleClickVideo = useCallback((video) => setSelectedVideo(video), []);
  const handleCloseVideo = useCallback(() => setSelectedVideo(null), []);

  if (dialogsLoading) {
    return <Loading fullPage message="Загружаем диалоги..." size="large" />;
  }

  return (
    <div className={style.page}>
      {/* Панель диалогов */}
      <div className={`${style.dialogsCol} ${showMobileDialogs ? style.mobileVisible : ''}`}>
        <div className={style.search}>
          <div className={style.header}>
            <h2 className={style.title}>Сообщения</h2>
          </div>
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск диалога ..."
          />
        </div>
        <DialogsGrid
          dialogs={dialogs}
          currentUserId={currentUserId}
          onSelect={handleSelect}
          selectedUserId={selectedUser?.id}
        />
      </div>

      {/* Панель чата */}
      <div className={`${style.chatCol} ${!showMobileDialogs ? style.mobileVisible : ''}`}>
        <ChatGrid
          messages={messages}
          currentUserId={currentUserId}
          selectedUser={selectedUser}
          messagesLoading={messagesLoading}
          userLoading={userLoading}
          onSendMessage={sendMessage}
          onDeleteMessage={deleteMessage}
          onEditMessage={editMessage}
          onBack={handleBack}
          onPlayVideo={handleClickVideo}
          markAsRead={markAsRead}
          onClearChat={clearChat}
          partnerOnline={partnerOnline}
        />
      </div>
      {/* Модальный видеоплеер */}
      {selectedVideo && <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />}
    </div>
  );
};
