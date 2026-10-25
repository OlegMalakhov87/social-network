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
 * Отображает карточку друга.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.friend - Друг.
 * @param {Function} props.onFollow - Обработчик заявки в друзья.
 * @param {Function} props.onUnfollow - Обработчик удаления из друзей.
 * @param {Function} props.onAccept - Обработчик принятия заявки.
 * @param {Function} props.onUnlock - Обработчик снятия блокировки.
 * @param {Function} props.onBlock - Обработчик блокировки.
 * @returns {JSX.Element|null} Разметка карточки.
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

  const friendDetails = useMemo(() => getFriendDetails(friend), [friend]);

  if (!friend?.id) return null;

  const friendshipButton = getFriendshipButtonConfig({
    user: friend,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock: () => setShowBlockDialog(true),
  });

  const friendshipBadge = getFriendshipBadge(
    friend.friendshipStatus,
    friend.friendshipDirection
  );

  const handleOpenProfile = () => {
    navigate(`/profile/${friend.id}`);
  };

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
                  {friend.online ? 'В сети' : 'Не в сети'}
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
