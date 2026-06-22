import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './UserProfileCard.module.css';
import { getButtonProps } from '../../../entities/friend';
import { ImageWithFallback } from '../../../shared/lib';
import { Loading } from '../../../shared/ui';
/**
 * Карточка профиля пользователя.
 * @param {Object} props
 * @param {Object} props.targetUser - пользователь, чей профиль открыт
 * @param {Object} props.currentUser - текущий авторизованный
 * @param {string} props.friendshipStatus - статус дружбы
 * @param {string} props.friendshipDirection - направление заявки
 * @param {Object} props.friendshipActions - экшены для дружбы
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

  // Кнопка действий дружбы
  const buttonProps = useMemo(() => {
    if (!targetUser?.id || currentUser?.id === targetUser?.id) return null;

    return getButtonProps({
      friendshipStatus,
      friendshipDirection,
      onFollow: () => onFollow(targetUser?.id),
      onUnfollow: () => onUnfollow(friendshipId, targetUser?.id),
      onAccept: () => onAccept(friendshipId, targetUser?.id),
      onUnlock: () => onUnlock(friendshipId, targetUser?.id),
      onBlock: () => onBlock(targetUser?.id),
    });
  }, [
    targetUser?.id,
    currentUser?.id,
    friendshipStatus,
    friendshipDirection,
    onFollow,
    onUnfollow,
    onAccept,
    onUnlock,
    onBlock,
    friendshipId,
  ]);

  const handleSendMessage = (e) => {
    e?.preventDefault?.();
    if (currentUser?.id && targetUser?.id) {
      navigate(`/messages/${targetUser?.id}`);
    }
  };

  // Поля для отображения
  const infoFields = [
    { label: 'Никнейм:', value: targetUser?.nickname },
    { label: 'Имя:', value: targetUser?.name },
    { label: 'Возраст:', value: targetUser?.age },
    { label: 'Email:', value: targetUser?.email },
    { label: 'Город:', value: targetUser?.address },
    { label: 'Работа:', value: targetUser?.job },
    { label: 'Статус:', value: targetUser?.status },
    { label: 'Телефон:', value: targetUser?.phone },
  ];

  if (!targetUser?.id) {
    return <Loading fullPage message="Загрузка профиля..." size="large" />;
  }

  return (
    <div className={style.profileInfo}>
      <div className={style.avatarSection}>
        <div className={style.avatar}>
          <ImageWithFallback src={targetUser.photoUrl} fallback="/avatar.jpg" alt="Фото" />
        </div>

        {currentUser?.id !== targetUser.id && buttonProps && (
          <>
            <button
              className={`${style.actionButton} ${style[buttonProps.className]}`}
              onClick={buttonProps.action}
              disabled={!buttonProps.action}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label={buttonProps.text}
            >
              <span className={style.buttonText}>
                {isHovered && buttonProps.hoverText !== buttonProps.text
                  ? buttonProps.hoverText
                  : buttonProps.text}
              </span>
            </button>

            <button
              onClick={handleSendMessage}
              className={style.messageButton}
              aria-label="Написать сообщение"
            >
              Написать сообщение
            </button>
            {userOnline ? '🟢 В сети' : '⚫ Не в сети'}
          </>
        )}
      </div>

      <div className={style.info}>
        {infoFields.map((field, index) => (
          <div key={index} className={style.infoRow}>
            <span className={style.infoLabel}>{field.label}</span>
            <span className={style.infoValue}>{field.value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
