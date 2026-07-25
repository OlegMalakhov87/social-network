import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message } from '../../../entities/dialog';
import { normalizeSharedMessage } from '../../../entities/sharedEntity';
import { MessageForm } from '../../../features/dialogs';
import { useShareEntity } from '../../../features/sharedEntities';
import {
  ContentState,
  EntityHeader,
  EntityMeta,
  ErrorBanner,
  IconButton,
  InfiniteScrollFooter,
  StatusBadge,
} from '../../../shared/ui';
import style from './ChatGrid.module.css';

/**
 * Компонент отображения чата.
 * @param {Object} props
 * @param {Array} props.messages - массив сообщений
 * @param {number} props.currentUserId - ID текущего пользователя
 * @param {Object} props.selectedUser - объект выбранного пользователя
 * @param {boolean} props.isLoadingMessages - флаг загрузки сообщений
 * @param {boolean} props.isLoadingMore - флаг загрузки следующей порции сообщений
 * @param {boolean} props.hasMore - флаг наличия следующей порции сообщений
 * @param {Error} props.messagesError - ошибка загрузки сообщений
 * @param {Error} props.userError - ошибка загрузки пользователя
 * @param {Function} props.loadMore - колбэк загрузки следующей порции сообщений
 * @param {Function} props.onRetry - колбэк повторной загрузки
 * @param {boolean} props.isLoadingUser - флаг загрузки пользователя
 * @param {Function} props.onSendMessage - колбэк отправки сообщения
 * @param {Function} props.onDeleteMessage - колбэк удаления сообщения
 * @param {Function} props.onUpdateMessage - колбэк обновления сообщения
 * @param {Function} props.onToggleLike - колбэк лайка сообщения
 * @param {Function} props.onBack - колбэк назад
 * @param {Function} props.onPlayMedia - колбэк воспроизведения медиа
 * @param {Function} props.markAsRead - колбэк чтения сообщения
 * @param {Function} props.onClearChat - колбэк очистки чата
 * @param {boolean} props.partnerOnline - флаг онлайн-статуса собеседника
 */
export const ChatGrid = ({
  messages = [],
  currentUserId,
  selectedUser,
  isLoadingMessages,
  isLoadingMore,
  hasMore,
  messagesError,
  userError,
  loadMore,
  onRetry,
  isLoadingUser,
  onSendMessage,
  onDeleteMessage,
  onUpdateMessage,
  onToggleLike,
  onBack,
  onPlayMedia,
  markAsRead,
  onClearChat,
  partnerOnline,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (messages.length > 0 && selectedUser?.id) {
      markAsRead?.();
    }
  }, [messages, selectedUser?.id, markAsRead]);

  /** Хук для работы с расшаренными сущностями в sessionStorage.*/
  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedMessage,
    onSuccess: () => navigate('/messages'),
  });

  return (
    <ContentState
      loading={isLoadingUser || (isLoadingMessages && messages.length === 0)}
      error={userError || (messagesError && messages?.length === 0)}
      isEmpty={!messages?.length}
      loadingMessage={
        isLoadingUser ? 'Загружаем пользователя...' : 'Загружаем сообщения...'
      }
      emptyIcon="💬"
      emptyTitle="Нет сообщений"
      emptyDescription="Начните общение с друзьями"
      onRetry={onRetry}
    >
      <div className={style.chat}>
        {/* Шапка чата  */}
        <EntityHeader className={style.chatHeader}>
          <IconButton
            icon="←"
            variant="ghost"
            size="md"
            onClick={onBack}
            ariaLabel="Назад к списку диалогов"
          />

          <div
            className={style.userInfo}
            onClick={() =>
              selectedUser?.id && navigate(`/profile/${selectedUser?.id}`)
            }
          >
            <EntityMeta
              avatar={selectedUser?.photoUrl}
              title={selectedUser?.name}
              fallback="/userPhoto.jpg"
            />
            <StatusBadge
              status={partnerOnline ? 'online' : 'offline'}
              label={partnerOnline ? 'В сети' : 'Не в сети'}
              size="sm"
              className={style.statusBadge}
            />
          </div>

          <IconButton
            icon="🗑️"
            variant="ghost"
            size="sm"
            onClick={() => onClearChat?.(selectedUser?.id)}
            ariaLabel="Очистить чат"
          />
        </EntityHeader>

        {/* Список сообщений */}
        <div className={style.messagesList}>
          {messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
              isOwn={msg.senderId === currentUserId}
              sharedEntity={msg.sharedEntity}
              onPlayMedia={onPlayMedia}
              onShareEntity={shareEntity}
              toggleLike={onToggleLike}
              onUpdate={onUpdateMessage}
              onDelete={onDeleteMessage}
            />
          ))}
        </div>

        {messages.length > 0 && (
          <>
            <InfiniteScrollFooter
              hasMore={hasMore}
              isLoading={isLoadingMore}
              error={messagesError}
              onRetry={loadMore}
              endMessage="Сообщений больше нет"
            />
            {messagesError && messages.length > 0 && (
              <ErrorBanner
                message="Не удалось загрузить сообщения"
                onRetry={loadMore}
              />
            )}
          </>
        )}

        {/* Форма отправки */}
        <MessageForm partnerId={selectedUser?.id} onSubmit={onSendMessage} />
      </div>
    </ContentState>
  );
};
