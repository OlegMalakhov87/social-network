import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useDialogs,
  useDialogsActions,
  useMessages,
} from '../../../features/dialogs';
import { useShareEntity } from '../../../features/shared-entities';
import { useOnline, useProfile } from '../../../features/users';
import {
  ErrorBoundary,
  PageLayout,
  SearchField,
  SectionCard,
} from '../../../shared/ui';
import { classNames } from '../../../shared/utils';
import { ChatGrid, DialogsGrid } from '../../../widgets/dialogs-list';
import { VideoPlayer } from '../../../widgets/video-player';

import style from './DialogsPage.module.css';

/**
 * Отображает страницу диалогов.
 *
 * @returns {JSX.Element} Разметка страницы.
 */
export const DialogsPage = () => {
  const { userId: userParam } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageVideo, setMessageVideo] = useState(null);

  const parsedUserId = Number(userParam);

  const partnerId =
    userParam && Number.isSafeInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

  // Читает общую сущность из sessionStorage.
  const { getSharedEntity, clearSharedEntity } = useShareEntity({});

  const {
    dialogs,
    currentUserId,
    isLoading: dialogsLoading,
    isLoadingMore: dialogsLoadingMore,
    hasMore: dialogsHasMore,
    error: dialogsError,
    loadMore: loadDialogs,
    refetch: refetchDialogs,
  } = useDialogs({ searchQuery });

  const dialogUser =
    dialogs.find((dialog) => dialog.user.id === partnerId)?.user ?? null;

  const {
    user: loadedUser,
    isLoading: userLoading,
    error: userError,
  } = useProfile(partnerId && !dialogUser ? partnerId : null);

  const selectedUser =
    dialogUser ?? (loadedUser?.id === partnerId ? loadedUser : null);

  const showMobileDialogs = partnerId === null;

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
  } = useMessages({ partnerId: selectedUser?.id ?? null });

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

  const onlineMap = useOnline(selectedUser?.id);
  const partnerOnline = onlineMap.get(selectedUser?.id) ?? false;

  // Отправляет общий пост, новость, комментарий, фото, видео, трек или сообщение.
  useEffect(() => {
    if (selectedUser?.id) {
      sendSharedEntity(selectedUser.id);
    }
  }, [selectedUser?.id, sendSharedEntity]);

  /**
   * Выбирает собеседника и открывает диалог.
   *
   * @param {Object} user - Данные собеседника
   * @returns {void}
   */
  const handleSelect = useCallback(
    (user) => {
      if (!user?.id) return;

      navigate(`/messages/${user.id}`);
      setSearchQuery('');
    },
    [navigate]
  );

  /**
   * Возвращается к списку диалогов.
   *
   * @returns {void}
   */
  const handleBack = useCallback(() => {
    navigate('/messages');
  }, [navigate]);

  /**
   * Открывает видео сообщения.
   *
   * @param {Object} video - Данные видео
   * @returns {void}
   */
  const handleOpenVideo = useCallback((video) => setMessageVideo(video), []);

  const handleCloseVideo = useCallback(() => setMessageVideo(null), []);

  return (
    <ErrorBoundary>
      <PageLayout title="Сообщения">
        <div className={style.page}>
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

          <SectionCard
            className={classNames(
              style.chatCol,
              !showMobileDialogs && style.mobileVisible
            )}
          >
            <ChatGrid
              messages={messages}
              currentUserId={currentUserId}
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
