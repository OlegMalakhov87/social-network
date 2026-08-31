import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriendshipButtonConfig } from '../../../entities/friend';
import {
  getProfileActions,
  getProfileFields,
  ProfileActions,
  ProfileMeta,
} from '../../../entities/user';
import {
  Avatar,
  Badge,
  BaseCard,
  ConfirmDialog,
  EntityContent,
  EntityHeader,
  EntityInfoList,
} from '../../../shared/ui';

/**
 * Карточка профиля пользователя.
 *
 * @param {Object} props
 * @param {Object|null} props.targetUser - пользователь, профиль которого отображается.
 * @param {Object|null} props.currentUser - текущий пользователь.
 * @param {boolean} props.isOwnProfile - флаг владельца профиля.
 * @param {Error|null} props.error - ошибка.
 * @param {Function} props.refetchUser - функция для обновления данных пользователя.
 * @param {Function} props.onFollow - функция для подписания на пользователя.
 * @param {Function} props.onUnfollow - функция для отписки от пользователя.
 * @param {Function} props.onAccept - функция для принятия запроса на дружбу.
 * @param {Function} props.onUnlock - функция для разблокировки пользователя.
 * @param {Function} props.onBlock - функция для блокировки пользователя.
 */

export const Profile = ({
  targetUser,
  currentUser,
  isOwnProfile,
  error,
  refetchUser,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  /** Отображения полей с данными пользователя */
  const infoFields = useMemo(() => getProfileFields(targetUser), [targetUser]);

  /** Кнопка действий дружбы */
  const friendshipButton = getFriendshipButtonConfig({
    user: targetUser,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock: () => setShowBlockDialog(true),
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
    onSendMessage: handleSendMessage,
  });

  /** Обработчик подтверждения блокировки */
  const handleConfirmBlock = () => {
    onBlock?.(targetUser.id);
    setShowBlockDialog(false);
  };

  if (!targetUser?.id) {
    return null;
  }

  return (
    <>
      <BaseCard
        header={
          <EntityHeader>
            <ProfileMeta
              avatar={
                <Avatar
                  src={targetUser?.avatarUrl}
                  alt={targetUser?.name}
                  size="xl"
                  status={targetUser?.online ? 'online' : 'offline'}
                />
              }
              title={targetUser?.name}
              subtitle={
                targetUser?.nickname ? `@${targetUser?.nickname}` : null
              }
              badge={
                targetUser?.canSeeFullProfile === false ? (
                  <Badge size="sm" variant="warning">
                    🔒 Закрытый профиль
                  </Badge>
                ) : null
              }
              extra={<ProfileActions actions={actions} />}
            />
          </EntityHeader>
        }
        content={
          <EntityContent>
            <EntityInfoList items={infoFields} />
          </EntityContent>
        }
      />
      <ConfirmDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleConfirmBlock}
        title="Заблокировать пользователя?"
        description="Этот пользователь больше не сможет связаться с вами."
        confirmText="Заблокировать"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
