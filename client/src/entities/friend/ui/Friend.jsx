import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFriendDetails,
  getFriendshipBadge,
  getFriendshipButtonConfig,
} from '..';
import {
  Avatar,
  Badge,
  BaseCard,
  Button,
  ConfirmDialog,
  EntityContent,
  EntityHeader,
  EntityInfoList,
  EntityMeta,
  StatusBadge,
} from '../../../shared/ui';

/**
 * Карточка пользователя.
 *
 * @param {Object} props - параметры
 * @param {Object} props.friend - данные друга
 * @param {Function} props.onFollow - обработчик нажатия на кнопку "Добавить в друзья"
 * @param {Function} props.onUnfollow - обработчик нажатия на кнопку "Убрать из друзей"
 * @param {Function} props.onAccept - обработчик нажатия на кнопку "Принять заявку"
 * @param {Function} props.onUnlock - обработчик нажатия на кнопку "Разблокировать"
 * @param {Function} props.onBlock - обработчик нажатия на кнопку "Заблокировать"
 * @returns {JSX.Element} - компонент карточки друга.
 */
export const Friend = ({
  friend,
  onFollow,
  onUnfollow,
  onAccept,
  onUnlock,
  onBlock,
}) => {
  const navigate = useNavigate();
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  /** Информация о друге */
  const friendDetails = useMemo(() => getFriendDetails(friend), [friend]);

  if (!friend?.id) return null;

  /** Конфигурация кнопки дружбы */
  const friendshipButton = getFriendshipButtonConfig({
    user: friend,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock: () => setShowBlockDialog(true),
  });

  /** Конфигурация значка дружбы */
  const friendshipBadge = getFriendshipBadge(
    friend.friendshipStatus,
    friend.friendshipDirection
  );

  /** Обработчик открытия профиля */
  const handleOpenProfile = () => {
    navigate(`/profile/${friend.id}`);
  };

  /** Обработчик подтверждения блокировки */
  const handleConfirmBlock = () => {
    onBlock?.(friend.id);
    setShowBlockDialog(false);
  };

  return (
    <>
      <BaseCard
        header={
          <EntityHeader
            bottomSlot={
              friendshipBadge && (
                <StatusBadge
                  status={friendshipBadge.status}
                  label={friendshipBadge.label}
                  size="sm"
                />
              )
            }
          >
            <EntityMeta
              avatar={
                <Avatar
                  src={friend.avatarUrl}
                  alt={friend.name}
                  size="lg"
                  status={friend.online ? 'online' : 'offline'}
                  clickable={!friend.isBlocked}
                  onClick={handleOpenProfile}
                />
              }
              title={friend.name}
              subtitle={friend.nickname ? `@${friend.nickname}` : null}
              badge={
                <Badge size="sm" variant="secondary">
                  {friend.online ? 'online' : 'offline'}
                </Badge>
              }
            />
          </EntityHeader>
        }
        content={
          <EntityContent>
            <EntityInfoList items={friendDetails} />
          </EntityContent>
        }
        actions={
          <Button
            fullWidth
            variant={friendshipButton.variant}
            disabled={friendshipButton.disabled}
            hoverText={friendshipButton.hoverText}
            onClick={(event) => {
              event.stopPropagation();
              friendshipButton.action?.();
            }}
          >
            {friendshipButton.text}
          </Button>
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
