import style from './DialogCard.module.css';
import { formatTime, ImageWithFallback } from '../../../shared/lib';

/**
 * Карточка диалога в списке.
 * @param {Object} props
 * @param {Object} props.user - пользователь
 * @param {boolean} props.isActive - выбран ли диалог
 * @param {Function} props.onSelect - колбэк выбора
 * @param {number} props.currentUserId - ID текущего пользователя
 * @param {Object|null} props.lastMessage - последнее сообщение
 */
export const DialogCard = ({ user, isActive, onSelect, currentUserId, lastMessage }) => {
  return (
    <li
      className={`${style.dialogItem} ${isActive ? style.active : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(user);
      }}
    >
      <div className={style.dialogContent}>
        <div className={style.avatar}>
          <ImageWithFallback src={user.photoUrl} alt="Фото" fallback="/userPhoto.jpg" />
        </div>
        <div className={style.dialogInfo}>
          <div className={style.dialogName}>
            {user.name}
            <span className={style.dialogTime}>{lastMessage && formatTime(lastMessage.date)}</span>
          </div>
          <div className={style.dialogLastMessage}>
            {lastMessage ? (
              <>
                {lastMessage.isOwn && 'Вы: '}
                {lastMessage.text}
              </>
            ) : (
              'Сообщений нет'
            )}
          </div>
          <div className={style.dialogStatus}>
            <span className={user.online ? style.onlineDot : style.offlineDot} />
          </div>
        </div>
      </div>
    </li>
  );
};
