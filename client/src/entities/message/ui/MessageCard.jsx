import style from './MessageCard.module.css';
import { SharedPostCard } from '../../message';
import { formatTime, linkify } from '../../../shared/lib';

/**
 * Карточка одного сообщения.
 * @param {Object} props
 * @param {Object} props.message - объект сообщения
 * @param {boolean} props.isOwn - принадлежит ли текущему пользователю
 * @param {React.ReactNode} [props.actions] - дополнительные кнопки действий
 * @param {Object} props.sharedPost - сообщение с типом 'sharedPost' для конопки поделиться на карточке поста
 * @param {Function} props.onPlayVideo - воспроизвести видео
 */

export const MessageCard = ({ message, isOwn, actions, sharedPost, onPlayVideo }) => {
  return (
    <div className={`${style.messageWrapper} ${isOwn ? style.own : ''}`}>
      <div className={`${style.message} ${isOwn ? style.own : style.other}`}>
        {sharedPost ? (
          <SharedPostCard post={sharedPost} onPlayVideo={onPlayVideo} />
        ) : (
          <div className={style.messageContent}>{linkify(message.text)}</div>
        )}
        <div className={style.messageTime}>
          {message.isEdited && <span className={style.editedLabel}> (изменено)</span>}
          {message.isEdited ? formatTime(message.updateDate) : formatTime(message.createDate)}
          {isOwn && <span className={style.messageStatus}>{message.isRead ? '✓✓' : '✓'}</span>}
          {actions && <div className={style.messageActions}>{actions}</div>}
        </div>
      </div>
    </div>
  );
};
