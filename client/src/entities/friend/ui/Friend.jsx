import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getFriendDetails,
  getFriendshipBadge,
  getFriendshipButtonConfig,
} from '..';
import {
  Avatar,
  BaseCard,
  Button,
  ConfirmDialog,
  EntityContent,
  EntityDetails,
  EntityHeader,
  EntityMeta,
  StatusBadge,
} from '../../../shared/ui';
import style from './Friend.module.css';

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

  if (!friend?.id) return null;

  /** Конфигурация кнопки дружбы */
  const friendshipButton = getFriendshipButtonConfig({
    friend,
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

  /** Информация о друге */
  const friendDetails = getFriendDetails(friend);

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
          <EntityHeader>
            <Avatar
              src={friend.photoUrl}
              alt={friend.name}
              size="xl"
              clickable={true}
              onClick={handleOpenProfile}
            />

            <EntityMeta
              title={friend.name}
              subtitle={`@${friend.nickname}`}
              badge={friend.online ? 'online' : 'offline'}
            />

            {friendshipBadge && (
              <StatusBadge
                status={friendshipBadge.status}
                label={friendshipBadge.label}
                size="sm"
              />
            )}
          </EntityHeader>
        }
        content={
          <EntityContent>
            <EntityDetails items={friendDetails} />
          </EntityContent>
        }
        actions={
          <Button
            fullWidth
            variant={friendshipButton.variant}
            disabled={friendshipButton.disabled}
            className={style.friendshipButton}
            onClick={(event) => {
              event.stopPropagation();
              friendshipButton.action?.();
            }}
          >
            <span className={style.defaultText}>{friendshipButton.text}</span>

            <span className={style.hoverText}>
              {friendshipButton.hoverText}
            </span>
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
