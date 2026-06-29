import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './UserProfileCard.module.css';
import { useFriendshipButton } from '../../../entities/friend';
import { getProfileFields } from '../../../entities/user';
import {
  PageLoader,
  Avatar,
  Button,
  StatusBadge,
  ProfileInfoList,
} from '../../../shared/ui';

/**
 * Карточка профиля пользователя.
 *
 * @param {Object} props
 * @param {Object|null} props.targetUser
 * @param {Object|null} props.currentUser
 * @param {string|null} props.friendshipStatus
 * @param {string|null} props.friendshipDirection
 * @param {number|null} props.friendshipId
 * @param {boolean} props.userOnline
 * @param {(userId:number)=>void} props.onFollow
 * @param {(friendshipId:number,userId:number)=>void} props.onUnfollow
 * @param {(friendshipId:number,userId:number)=>void} props.onAccept
 * @param {(friendshipId:number,userId:number)=>void} props.onUnlock
 * @param {(userId:number)=>void} props.onBlock
 */

export const UserProfileCard = ({
  targetUser,
  currentUser,
  friendshipStatus,
  friendshipDirection,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
  friendshipId,
  userOnline,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Владелец профиля
  const isOwnProfile = currentUser?.id === targetUser?.id;

  // Отображения полей с данными пользователя
  const infoFields = useMemo(() => getProfileFields(targetUser), [targetUser]);

  // Кнопка действий дружбы
  const friendshipButton = useFriendshipButton({
    targetUser,
    currentUser,
    friendshipStatus,
    friendshipDirection,
    friendshipId,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock,
  });

  // Обработчик перхода на страницу диалогов
  const handleSendMessage = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (currentUser?.id && targetUser?.id) {
        navigate(`/messages/${targetUser?.id}`);
      }
    },
    [currentUser?.id, targetUser?.id, navigate]
  );

  if (!targetUser?.id) {
    return <PageLoader message="Загрузка профиля..." />;
  }

  return (
    <div className={style.profileInfo}>
      <div className={style.avatarSection}>
        <Avatar
          size="xl"
          src={targetUser.photoUrl}
          fallback="/avatar.jpg"
          alt={targetUser.name || targetUser.nickname}
        />

        {!isOwnProfile && friendshipButton && (
          <div className={style.actions}>
            <Button
              fullWidth
              buttonVariant={friendshipButton.variant}
              onClick={friendshipButton.onClick}
              disabled={friendshipButton.disabled}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {isHovered ? friendshipButton.hoverText : friendshipButton.text}
            </Button>
            <Button variant="secondary" fullWidth onClick={handleSendMessage}>
              Написать сообщение
            </Button>
            <StatusBadge
              status={userOnline ? 'online' : 'offline'}
              label={userOnline ? 'В сети' : 'Не в сети'}
            />
          </div>
        )}
        <ProfileInfoList items={infoFields} />
      </div>
    </div>
  );
};
