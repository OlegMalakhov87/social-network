import { EntityMeta, StatusBadge, Text } from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';
import style from './Dialog.module.css';

/**
 * Компонент отображения диалога.
 * @param {Object} props
 * @param {Object} props.user - объект пользователя
 * @param {boolean} props.isActive - флаг активности диалога
 * @param {Function} props.onSelect - функция для выбора диалога
 * @param {Object} props.lastMessage - объект последнего сообщения
 */
export const Dialog = ({ user, isActive, onSelect, lastMessage }) => {
  return (
    <div
      className={classNames(style.dialogItem, isActive ? style.active : '')}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(user);
      }}
      role="button"
      tabIndex={0}
      aria-label={`Открыть диалог с ${user.name}`}
    >
      <EntityMeta
        avatar={user.photoUrl}
        title={user.name}
        subtitle={
          lastMessage ? (
            <Text variant="caption" className={style.lastMessageText}>
              {lastMessage.isOwn ? 'Вы: ' : ''}
              {lastMessage.text}
            </Text>
          ) : (
            <Text variant="caption">Нет сообщений</Text>
          )
        }
      />
      <div className={style.rightColumn}>
        <Text variant="caption" className={style.timeText}>
          {lastMessage && formatDate(lastMessage.date)}
        </Text>
        <StatusBadge status={user.online ? 'online' : 'offline'} size="sm" />
      </div>
    </div>
  );
};
