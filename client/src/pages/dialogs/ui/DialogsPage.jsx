import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useShareEntity } from '../../../features/sharedEntities';
import {
  useDialogs,
  useDialogsActions,
  useMessages,
} from '../../../features/dialogs';
import { useOnline, useUserProfile } from '../../../features/users';
import { classNames } from '../../../shared/lib';
import {
  ErrorBoundary,
  PageLayout,
  SearchField,
  SectionCard,
} from '../../../shared/ui';
import { ChatGrid, DialogsGrid } from '../../../widgets/dialogs-list';
import { VideoPlayer } from '../../../widgets/video-player';
import style from './DialogsPage.module.css';

/** Страница диалогов – отображает список диалогов и чат с собеседником. */

export const DialogsPage = () => {
  const { userId: userParam } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMobileDialogs, setShowMobileDialogs] = useState(true);
  const [messageVideo, setMessageVideo] = useState(null);

/** Хук для работы с расшаренными сущностями в sessionStorage.*/
const { getSharedEntity, clearSharedEntity } = useShareEntity({});

  /** Получение данных о диалогах. */
  const {
    dialogs,
    currentUser,
    isLoading: dialogsLoading,
    isLoadingMore: dialogsLoadingMore,
    hasMore: dialogsHasMore,
    error: dialogsError,
    loadMore: loadDialogs,
    refetch: refetchDialogs,
  } = useDialogs(searchQuery);

  /** Получение данных о сообщениях. */
  const {
    messages,
    isLoading: messagesLoading,
    isLoadingMore: messagesLoadingMore,
    hasMore: messagesHasMore,
    error: messagesError,
    loadMore: loadMessages,
    refetch: refetchMessages,
    replaceOptimistic,
    updateMessageInState,
    markAsRead,
    addOptimistic,
    removeOptimistic,
    toggleLike,
  } = useMessages(selectedUser?.id);

  /** Действия над диалогами и сообщениями. */
  const {
    sendMessage,
    deleteMessage,
    updateMessage,
    sendSharedEntity,
    clearChat,
  } = useDialogsActions(
    addOptimistic,
    replaceOptimistic,
    removeOptimistic,
    updateMessageInState,
    refetchDialogs,
    refetchMessages,
    getSharedEntity,
    clearSharedEntity
  );

  /** Получение данных о пользователе. */
  const {
    user: loadedUser,
    isLoading: userLoading,
    error: userError,
  } = useUserProfile(userParam && !selectedUser ? Number(userParam) : null);

  /** Проверка онлайн статуса собеседника. */
  const onlineMap = useOnline(selectedUser?.id);
  const partnerOnline = onlineMap.get(selectedUser?.id) ?? false;

  /** Установка выбранного пользователя. */
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

  /** Отправка общего поста, новости, комментария, фото, видео, трека и сообщения. */
  useEffect(() => {
    if (selectedUser?.id) {
      sendSharedEntity(selectedUser.id);
    }
  }, [selectedUser?.id, sendSharedEntity]);

  /** Обработчик выбора пользователя. */
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

  /** Обработчик кнопки назад. */
  const handleBack = useCallback(() => {
    setShowMobileDialogs(true);
    navigate('/messages');
  }, [navigate]);

  /** Обработчик открытия модального окна с видео. */
  const handleOpenVideo = useCallback((video) => setMessageVideo(video), []);
  /** Обработчик закрытия модального окна с видео. */
  const handleCloseVideo = useCallback(() => setMessageVideo(null), []);

  return (
    <ErrorBoundary>
      <PageLayout title="Сообщения">
        <div className={style.dialogsContainer}>
          {/* Панель диалогов */}
          <SectionCard
            className={classNames(
              style.dialogsCol,
              showMobileDialogs && style.mobileVisible
            )}
          >
            <SearchField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск диалога..."
            />

            <DialogsGrid
              dialogs={dialogs}
              onSelect={handleSelect}
              selectedUserId={selectedUser?.id}
              isLoading={dialogsLoading}
              isLoadingMore={dialogsLoadingMore}
              error={dialogsError}
              hasMore={dialogsHasMore}
              loadMore={loadDialogs}
              onRetry={refetchDialogs}
            />
          </SectionCard>

          {/* Панель чата */}
          <SectionCard
            className={classNames(
              style.chatCol,
              !showMobileDialogs && style.mobileVisible
            )}
          >
            <ChatGrid
              messages={messages}
              currentUserId={currentUser?.id}
              selectedUser={selectedUser}
              isLoadingMessages={messagesLoading}
              isLoadingMore={messagesLoadingMore}
              hasMore={messagesHasMore}
              messagesError={messagesError}
              userError={userError}
              loadMessages={loadMessages}
              onRetry={refetchMessages}
              isLoadingUser={userLoading}
              onSendMessage={sendMessage}
              onDeleteMessage={deleteMessage}
              onUpdateMessage={updateMessage}
              onToggleLike={toggleLike}
              onBack={handleBack}
              onPlayMedia={handleOpenVideo}
              markAsRead={markAsRead}
              onClearChat={clearChat}
              partnerOnline={partnerOnline}
            />
          </SectionCard>
        </div>

        {messageVideo && (
          <VideoPlayer video={messageVideo} onClose={handleCloseVideo} />
        )}
      </PageLayout>
    </ErrorBoundary>
  );
};
