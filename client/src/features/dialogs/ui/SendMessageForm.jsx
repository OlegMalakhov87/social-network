import { useState } from 'react';
import style from './SendMessageForm.module.css';

/**
 * Форма отправки сообщения.
 * @param {Object} props
 * @param {number} props.partnerId - ID получателя
 * @param {Function} props.sendMessage - колбэк отправки (принимает partnerId)
 */
export const SendMessageForm = ({ partnerId, sendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className={style.messageForm}>
      <div className={style.messageInputWrapper}>
        <textarea
          className={style.messageInput}
          placeholder="Написать сообщение..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={1}
        />
      </div>
      <button
        className={style.sendButton}
        onClick={(e) => {
          e.stopPropagation();
          sendMessage?.(partnerId, newMessage.trim());
          setNewMessage('');
        }}
        aria-label="Отправить сообщение"
        disabled={!newMessage.trim()}
      >
        ➤
      </button>
    </div>
  );
};
