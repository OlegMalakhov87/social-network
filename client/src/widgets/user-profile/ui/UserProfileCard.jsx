import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriendshipButton } from '../../../entities/friend';
import { getProfileActions, getProfileFields } from '../../../entities/user';
import {
  Avatar,
  BaseCard,
  ProfileActions,
  ProfileIdentity,
  ProfileInfoList,
  StatusBadge,
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
  friendshipId,
  userOnline,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,

}) => {
  const navigate = useNavigate();

  /** Владелец профиля */
  const isOwnProfile = currentUser?.id === targetUser?.id;

  /** Отображения полей с данными пользователя */
  const infoFields = useMemo(() => getProfileFields(targetUser), [targetUser]);

  /** Кнопка действий дружбы */
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

  /** Обработчик перхода на страницу диалогов */
  const handleSendMessage = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (currentUser?.id && targetUser?.id) {
        navigate(`/messages/${targetUser?.id}`);
      }
    },
    [currentUser?.id, targetUser?.id, navigate]
  );

  /** Действия профиля */
  const actions = getProfileActions({
    isOwnProfile,
    friendshipButton,
    onMessage: handleSendMessage,
  });

  if (!targetUser?.id) {
    return null;
  }

  return (
    <BaseCard
      content={
        <>
          <ProfileIdentity>
          <Avatar
            size="xl"
            src={targetUser?.photoUrl}
            fallback="/avatar.jpg"
            alt={targetUser?.name || targetUser?.nickname}
          />
  {!isOwnProfile && (
          <>
          <StatusBadge
            status={userOnline ? 'online' : 'offline'}
            label={userOnline ? 'В сети' : 'Не в сети'}
          />

          <ProfileActions actions={actions} />
          </>)}
          </ProfileIdentity>
          <ProfileInfoList items={infoFields} />
        </>
      }
    />
  );
};
