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
  ContentState,
  EntityContent,
  EntityHeader,
  EntityInfoList,
} from '../../../shared/ui';

/**
 * Отображает карточку профиля пользователя.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object|null} props.targetUser - Пользователь открытого профиля
 * @param {Object|null} props.currentUser - Текущий пользователь
 * @param {boolean} props.isOwnProfile - Признак собственного профиля
 * @param {Error|string|null} props.error - Ошибка загрузки профиля
 * @param {Function} props.refetchUser - Обработчик повторной загрузки профиля
 * @param {Function} props.onFollow - Обработчик подписки на пользователя
 * @param {Function} props.onUnfollow - Обработчик отписки от пользователя
 * @param {Function} props.onAccept - Обработчик принятия запроса в друзья
 * @param {Function} props.onUnlock - Обработчик снятия блокировки
 * @param {Function} [props.onBlock] - Обработчик блокировки пользователя
 * @returns {JSX.Element} Разметка карточки.
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

  const infoFields = useMemo(() => getProfileFields(targetUser), [targetUser]);

  const friendshipButton = getFriendshipButtonConfig({
    user: targetUser,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock: () => setShowBlockDialog(true),
  });

  /**
   * Открывает переписку с выбранным пользователем.
   *
   * @param {Object} [e] - Событие нажатия
   */
  const handleSendMessage = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (currentUser?.id && targetUser?.id) {
        navigate(`/messages/${targetUser?.id}`);
      }
    },
    [currentUser?.id, targetUser?.id, navigate]
  );

  const actions = getProfileActions({
    isOwnProfile,
    friendshipButton,
    onSendMessage: handleSendMessage,
  });

  const handleConfirmBlock = () => {
    onBlock?.(targetUser.id);
    setShowBlockDialog(false);
  };

  return (
    <ContentState
      error={!targetUser?.id ? error : null}
      isEmpty={!targetUser?.id}
      loadingMessage="Загружаем профиль..."
      emptyIcon="👤"
      emptyTitle="Ошибка профиля"
      emptyDescription="Не удалось загрузить профиль пользователя"
      onRetry={refetchUser}
    >
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
    </ContentState>
  );
};
