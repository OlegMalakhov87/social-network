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
 * @param {Object|null} props.targetUser - Пользователь, профиль которого отображается.
 * @param {Object|null} props.currentUser - Текущий пользователь.
 * @param {boolean} props.isOwnProfile - Флаг владельца профиля.
 * @param {string|null} props.friendshipStatus - Статус дружбы.
 * @param {string|null} props.friendshipDirection - Направление дружбы.
 * @param {number|null} props.friendshipId - ID дружбы.
 * @param {boolean} props.userOnline - Флаг онлайн/офлайн пользователя.
 * @param {(userId:number)=>void} props.onFollow - Функция для подписания на пользователя.
 * @param {(friendshipId:number,userId:number)=>void} props.onUnfollow - Функция для отписки от пользователя.
 * @param {(friendshipId:number,userId:number)=>void} props.onAccept - Функция для принятия запроса на дружбу.
 * @param {(friendshipId:number,userId:number)=>void} props.onUnlock - Функция для разблокировки пользователя.
 * @param {(userId:number)=>void} props.onBlock - Функция для блокировки пользователя.
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
          <ProfileInfoList items={infoFields} />
        </>
      }
    />
  );
};
