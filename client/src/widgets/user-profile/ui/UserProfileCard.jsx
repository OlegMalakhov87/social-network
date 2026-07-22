import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriendshipButtonConfig } from '../../../entities/friend';
import { getProfileActions, getProfileFields } from '../../../entities/user';
import {
  Avatar,
  BaseCard,
  EntityDetails,
  ProfileActions,
  ProfileIdentity,
  StatusBadge,
} from '../../../shared/ui';

/**
 * Карточка профиля пользователя.
 *
 * @param {Object} props
 * @param {Object|null} props.targetUser - пользователь, профиль которого отображается.
 * @param {Object|null} props.currentUser - текущий пользователь.
 * @param {boolean} props.isOwnProfile - флаг владельца профиля.
 * @param {string|null} props.friendshipStatus - статус дружбы.
 * @param {string|null} props.friendshipDirection - направление дружбы.
 * @param {number|null} props.friendshipId - id дружбы.
 * @param {boolean} props.userOnline - флаг онлайн/офлайн пользователя.
 * @param {(userId:number)=>void} props.onFollow - функция для подписания на пользователя.
 * @param {(friendshipId:number,userId:number)=>void} props.onUnfollow - функция для отписки от пользователя.
 * @param {(friendshipId:number,userId:number)=>void} props.onAccept - функция для принятия запроса на дружбу.
 * @param {(friendshipId:number,userId:number)=>void} props.onUnlock - функция для разблокировки пользователя.
 * @param {(userId:number)=>void} props.onBlock - функция для блокировки пользователя.
 */

export const UserProfileCard = ({
  targetUser,
  currentUser,
  isOwnProfile,
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

  /** Отображения полей с данными пользователя */
  const infoFields = useMemo(() => getProfileFields(targetUser), [targetUser]);

  /** Кнопка действий дружбы */
  const friendshipButton = getFriendshipButtonConfig({
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
              alt={targetUser?.name}
            />
            {!isOwnProfile && (
              <>
                <StatusBadge
                  status={userOnline ? 'online' : 'offline'}
                  label={userOnline ? 'В сети' : 'Не в сети'}
                />

                <ProfileActions actions={actions} />
              </>
            )}
          </ProfileIdentity>
          <EntityDetails items={infoFields} />
        </>
      }
    />
  );
};
