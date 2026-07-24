import { classNames, formatTime } from '../../../shared/lib';
import { EntityMeta, StatusBadge, Text } from '../../../shared/ui';
import style from './Dialog.module.css';

export const Dialog = ({ user, isActive, onSelect, lastMessage }) => {
  return (
    <div
      className={classNames(style.dialogItem, isActive ? style.active : '')}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(user);
      }}
    >
      <EntityMeta
        avatar={user.photoUrl}
        title={user.name}
        subtitle={lastMessage && formatTime(lastMessage.date)}
      />
      <Text>
        {lastMessage
          ? lastMessage.isOwn
            ? `Вы: ${lastMessage.text}`
            : `Новое сообщение: ${lastMessage.text}`
          : 'Сообщений нет'}
      </Text>

      <StatusBadge status={user.online ? 'online' : 'offline'} />
    </div>
  );
};
