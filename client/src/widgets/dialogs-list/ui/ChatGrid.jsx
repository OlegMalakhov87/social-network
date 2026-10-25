import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Message } from '../../../entities/dialog';
import { normalizeSharedMessage } from '../../../entities/shared-entity';
import { MessageForm } from '../../../features/dialogs';
import { useShareEntity } from '../../../features/shared-entities';
import { useInfiniteScrollTrigger } from '../../../shared/hooks';
import {
  ContentState,
  EntityHeader,
  EntityMeta,
  IconButton,
  InfiniteScrollFooter,
  StatusBadge,
} from '../../../shared/ui';

import styles from './ChatGrid.module.css';

/**
 * Отображает переписку с выбранным пользователем.
 *
 * @param {Object} props - Свойства компонента
 * @param {Array<Object>} [props.messages=[]] - Список сообщений
 * @param {number} props.currentUserId - Идентификатор текущего пользователя
 * @param {Object} props.selectedUser - Выбранный пользователь
 * @param {boolean} props.isLoadingMessages - Признак загрузки сообщений
 * @param {boolean} props.isLoadingMore - Признак загрузки следующей страницы
 * @param {boolean} props.hasMore - Признак наличия следующей страницы
 * @param {Error|string|null} props.messagesError - Ошибка загрузки сообщений
 * @param {Error|string|null} props.userError - Ошибка загрузки пользователя
 * @param {Function} props.loadMore - Обработчик загрузки следующей страницы
 * @param {Function} props.onRetry - Обработчик повторной загрузки
 * @param {boolean} props.isLoadingUser - Признак загрузки пользователя
 * @param {Function} props.onSendMessage - Обработчик отправки сообщения
 * @param {Function} props.onDeleteMessage - Обработчик удаления сообщения
 * @param {Function} props.onUpdateMessage - Обработчик обновления сообщения
 * @param {Function} props.onToggleLike - Обработчик переключения отметки «нравится»
 * @param {Function} props.onBack - Обработчик возврата к списку диалогов
 * @param {Function} props.onPlayMedia - Обработчик воспроизведения медиа
 * @param {Function} [props.markAsRead] - Обработчик отметки сообщений прочитанными
 * @param {Function} [props.onClearChat] - Обработчик очистки переписки
 * @param {boolean} props.partnerOnline - Признак нахождения собеседника в сети
 * @returns {JSX.Element} Разметка переписки.
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
  const messagesListRef = useRef(null);
  const scrollRestoreRef = useRef(null);
  const currentDialogRef = useRef(null);
  const stickToBottomRef = useRef(true);

  /**
   * Обрабатывает скролл.
   *
   * @returns {void}
   */
  const handleScroll = () => {
    const element = messagesListRef.current;
    if (!element) return;

    const distanceToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    stickToBottomRef.current = distanceToBottom < 80;
  };

  /**
   * Загружает старые сообщения.
   *
   * @returns {void}
   */
  const handleLoadOlder = useCallback(() => {
    const element = messagesListRef.current;

    if (
      !element ||
      !hasMore ||
      isLoadingMore ||
      isLoadingMessages ||
      !loadMore
    ) {
      return;
    }

    // Запоминаем положение до добавления старых сообщений.
    scrollRestoreRef.current = {
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    };

    loadMore();
  }, [hasMore, isLoadingMore, isLoadingMessages, loadMore]);

  const loadMoreRef = useInfiniteScrollTrigger({
    hasMore: hasMore && !isLoadingMessages,
    isLoadingMore,
    onLoadMore: handleLoadOlder,
    rootRef: messagesListRef,
    rootMargin: '100px 0px 0px 0px',
  });

  useLayoutEffect(() => {
    const element = messagesListRef.current;
    if (!element || isLoadingMessages) return;

    // Восстанавливаем положение после подгрузки старой истории.
    if (!isLoadingMore && scrollRestoreRef.current) {
      const { scrollHeight, scrollTop } = scrollRestoreRef.current;

      element.scrollTop = scrollTop + (element.scrollHeight - scrollHeight);

      scrollRestoreRef.current = null;
      return;
    }

    // При открытии другого диалога показываем его конец.
    if (currentDialogRef.current !== selectedUser?.id) {
      currentDialogRef.current = selectedUser?.id;
      stickToBottomRef.current = true;
      element.scrollTop = element.scrollHeight;
      return;
    }

    // Новые сообщения прокручивают чат вниз, только если пользователь уже был рядом с концом.
    if (!isLoadingMore && stickToBottomRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, isLoadingMessages, isLoadingMore, selectedUser?.id]);

  // Отмечает сообщения прочитанными, когда переписка уже загружена.
  useEffect(() => {
    if (messages.length > 0 && selectedUser?.id) {
      markAsRead?.();
    }
  }, [messages, selectedUser?.id, markAsRead]);

  const { shareEntity } = useShareEntity({
    normalizeFn: normalizeSharedMessage,
    onSuccess: () => navigate('/messages'),
  });

  if (!selectedUser?.id) {
    return (
      <ContentState
        loading={isLoadingUser}
        error={userError}
        isEmpty
        emptyIcon="💬"
        emptyTitle="Выберите диалог"
        emptyDescription="Выберите собеседника, чтобы начать общение"
      />
    );
  }

  return (
    <div className={styles.chat}>
      <EntityHeader className={styles.chatHeader}>
        <IconButton
          icon="←"
          variant="ghost"
          size="md"
          onClick={onBack}
          ariaLabel="Назад к списку диалогов"
        />

        <div
          className={styles.userInfo}
          onClick={() =>
            selectedUser?.id && navigate(`/profile/${selectedUser?.id}`)
          }
        >
          <EntityMeta
            avatar={selectedUser?.avatarUrl}
            title={selectedUser?.name}
            fallback="/user.jpg"
          />
          <StatusBadge
            status={partnerOnline ? 'online' : 'offline'}
            label={partnerOnline ? 'В сети' : 'Не в сети'}
            size="sm"
            className={styles.statusBadge}
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

      <div
        ref={messagesListRef}
        className={styles.messagesList}
        onScroll={handleScroll}
      >
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />

        {messages.length === 0 ? (
          <ContentState
            loading={isLoadingMessages}
            error={messagesError}
            isEmpty
            emptyIcon="💬"
            emptyTitle="Пока нет сообщений"
            emptyDescription="Напишите первое сообщение"
            onRetry={onRetry}
          />
        ) : (
          messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === currentUserId}
              sharedEntity={msg.sharedEntity}
              onPlayMedia={onPlayMedia}
              onShareEntity={shareEntity}
              toggleLike={onToggleLike}
              onUpdate={onUpdateMessage}
              onDelete={onDeleteMessage}
            />
          ))
        )}

        {messages.length > 0 && (
          <InfiniteScrollFooter
            hasMore={hasMore}
            isLoading={isLoadingMore}
            error={messagesError}
            onRetry={handleLoadOlder}
            endMessage="Сообщений больше нет"
          />
        )}
      </div>
      <MessageForm partnerId={selectedUser?.id} onSubmit={onSendMessage} />
    </div>
  );
};
