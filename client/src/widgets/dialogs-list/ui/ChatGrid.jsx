import { useEffect, useState } from 'react';
import style from './ChatGrid.module.css';
import { SendMessageForm } from '../../../features/dialogs';
import { MessageCard } from '../../../entities/message';
import { EmptyState, Loading } from '../../../shared/ui';
import { ImageWithFallback, isSharedPost } from '../../../shared/lib';

/**
 * Панель чата с выбранным пользователем.
 * @param {Object} props
 * @param {Array} props.messages - сообщения
 * @param {number} props.currentUserId - ID текущего пользователя
 * @param {Object|null} props.selectedUser - выбранный собеседник
 * @param {Function} props.onSendMessage - отправить сообщение (partnerId)
 * @param {Function} props.onDeleteMessage - удалить сообщение (messageId)
 * @param {Function} props.onEditMessage - редактировать сообщение (messageId, newText)
 * @param {Function} props.onPlayVideo - воспроизвести видео
 * @param {Function} props.onClearChat - очистить чат
 * @param {Function} props.onBack - вернуться к списку диалогов
 */
export const ChatGrid = ({
  messages,
  currentUserId,
  selectedUser,
  messagesLoading,
  userLoading,
  onSendMessage,
  onDeleteMessage,
  onEditMessage,
  onBack,
  onPlayVideo,
  markAsRead,
  onClearChat,
  partnerOnline,
}) => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  // Отмечаем прочтение при появлении сообщений
  useEffect(() => {
    if (messages.length > 0 && selectedUser) {
      markAsRead?.();
    }
  }, [messages, selectedUser, markAsRead]);

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editingMessageId) {
      onEditMessage(editingMessageId, editText.trim());
    }
    setEditingMessageId(null);
    setEditText('');
  };

  if (messagesLoading || userLoading) {
    return <Loading fullPage message="Загружаем сообщения..." size="large" />;
  }

  if (!selectedUser) {
    return (
      <div className={style.emptyWrapper}>
        <EmptyState
          icon="💬"
          title="Выберите диалог"
          description="Нажмите на имя пользователя, чтобы начать общение"
        />
      </div>
    );
  }

  return (
    <div className={style.chat}>
      {/* Шапка чата */}
      <div className={style.header}>
        <button
          className={style.backButton}
          onClick={(e) => {
            e?.stopPropagation();
            onBack?.();
          }}
          aria-label="Назад"
        >
          ←
        </button>
        <div className={style.avatar}>
          <ImageWithFallback src={selectedUser.photoUrl} alt="Фото" fallback="/userPhoto.jpg" />
        </div>
        <div className={style.userInfo}>
          <a href={`/profile/${selectedUser.id}`}>
            <div className={style.name}>{selectedUser.name}</div>
          </a>
          <div className={style.status}>
            <span className={partnerOnline ? style.onlineDot : style.offlineDot} />
            {partnerOnline ? 'В сети' : 'Был(а) недавно'}
          </div>
        </div>
        <div className={style.actions}>
          <button className={style.actionButton} aria-label="Позвонить">
            📞
          </button>
          <button
            className={style.actionButton}
            onClick={(e) => {
              e?.stopPropagation();
              onClearChat?.(selectedUser.id);
            }}
            aria-label="Очистить чат"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Список сообщений */}
      <div className={style.messagesList}>
        {messages.length > 0 ? (
          messages.map((msg) => {
            const sharedPost = isSharedPost(msg.text) ? JSON.parse(msg.text) : null;

            if (editingMessageId === msg.id) {
              return (
                // Режим редактирования
                <div key={msg.id} className={style.editWrapper}>
                  <textarea
                    className={style.editInput}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <div className={style.editActions}>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleSaveEdit?.();
                      }}
                      disabled={!editText.trim()}
                      aria-label="Сохранить"
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        handleCancelEdit?.();
                      }}
                      aria-label="Отмена"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <MessageCard
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === currentUserId}
                sharedPost={sharedPost}
                onPlayVideo={onPlayVideo}
                actions={
                  msg.senderId === currentUserId ? (
                    <>
                      {!sharedPost && (
                        <button
                          onClick={(e) => {
                            e?.stopPropagation();
                            handleStartEdit?.(msg);
                          }}
                          aria-label="Редактировать"
                        >
                          ✏️
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          onDeleteMessage?.(msg.id);
                        }}
                        aria-label="Удалить"
                      >
                        🗑️
                      </button>
                    </>
                  ) : null
                }
              />
            );
          })
        ) : (
          <div className={style.emptyWrapper}>
            <EmptyState
              icon="✏️"
              title="Нет сообщений"
              description="Напишите что-нибудь, чтобы начать диалог"
            />
          </div>
        )}
      </div>

      {/* Форма отправки */}
      <SendMessageForm partnerId={selectedUser.id} sendMessage={onSendMessage} />
    </div>
  );
};
