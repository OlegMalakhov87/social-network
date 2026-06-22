import { useState, useMemo } from 'react';
import style from './FriendCard.module.css';
import { ImageWithFallback } from '../../../shared/lib';
import { getButtonProps } from '../../friend';

export const FriendCard = ({
  friend,
  currentUserId,
  friendshipStatus,
  friendshipDirection,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Кнопка действий дружбы
  const buttonProps = useMemo(() => {
    if (!currentUserId) return null;

    return getButtonProps({
      friendshipStatus,
      friendshipDirection,
      onFollow: () => onFollow(friend?.id),
      onUnfollow: () => onUnfollow(friend?.friendshipId, friend?.id),
      onAccept: () => onAccept(friend?.friendshipId, friend?.id),
      onUnlock: () => onUnlock(friend?.friendshipId, friend?.id),
      onBlock: () => onBlock(friend?.id),
    });
  }, [
    currentUserId,
    friendshipStatus,
    friendshipDirection,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock,
    friend?.friendshipId,
    friend?.id,
  ]);

  return (
    <div className={style.friendCard}>
      <div
        className={style.cardHeader}
        onClick={(e) => {
          e?.stopPropagation?.();
          onClick(friend.id);
        }}
      >
        <ImageWithFallback
          className={style.avatar}
          src={friend.photoUrl}
          fallback="/userPhoto.jpg"
          alt="Фото пользователя"
        />
      </div>

      <div className={style.cardBody}>
        <div
          className={style.friendName}
          onClick={(e) => {
            e?.stopPropagation?.();
            onClick(friend.id);
          }}
        >
          {friend.name}
        </div>
        <div className={style.friendNickname}>
          @{friend.nickname}
          <span className={friend.online ? style.onlineStatus : style.offlineStatus} />
        </div>
        <div className={style.details}>
          {friend.age && (
            <div className={style.detailRow}>
              <span className={style.detailIcon}>🎂</span>
              <span className={style.detailLabel}>Возраст:</span>
              <span className={style.detailValue}>{friend.age}</span>
            </div>
          )}
          {friend.city && (
            <div className={style.detailRow}>
              <span className={style.detailIcon}>📍</span>
              <span className={style.detailLabel}>Город:</span>
              <span className={style.detailValue}>{friend.city}</span>
            </div>
          )}
          {friend.job && (
            <div className={style.detailRow}>
              <span className={style.detailIcon}>💼</span>
              <span className={style.detailLabel}>Работа:</span>
              <span className={style.detailValue}>{friend.job}</span>
            </div>
          )}
          {friend.status && (
            <div className={style.detailRow}>
              <span className={style.detailIcon}>📝</span>
              <span className={style.detailLabel}>Статус:</span>
              <span className={style.detailValue}>{friend.status}</span>
            </div>
          )}
        </div>

        {friendshipStatus && (
          <div
            className={`${style.statusBadge} ${
              friendshipStatus === 'accepted'
                ? style.accepted
                : friendshipStatus === 'pending'
                  ? friendshipDirection === 'incoming'
                    ? style.incoming
                    : style.outgoing
                  : friendshipStatus === 'blocked'
                    ? friendshipDirection === 'incoming'
                      ? style.blockedMeBadge
                      : style.blockedByMeBadge
                    : ''
            }`}
          >
            {friendshipStatus === 'accepted' && 'Ваш друг'}
            {friendshipStatus === 'pending' &&
              friendshipDirection === 'incoming' &&
              'Входящая заявка'}
            {friendshipStatus === 'pending' &&
              friendshipDirection === 'outgoing' &&
              'Исходящая заявка'}
            {friendshipStatus === 'blocked' &&
              friendshipDirection === 'incoming' &&
              'Вы заблокировали'}
            {friendshipStatus === 'blocked' &&
              friendshipDirection === 'outgoing' &&
              'Вас заблокировали'}
          </div>
        )}

        <button
          className={`${style.actionButton} ${style[buttonProps.className]}`}
          onClick={buttonProps.action}
          disabled={!buttonProps.action}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className={style.buttonText}>
            {isHovered && buttonProps.hoverText !== buttonProps.text
              ? buttonProps.hoverText
              : buttonProps.text}
          </span>
        </button>
      </div>
    </div>
  );
};
