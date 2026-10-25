import { EntityMeta, StatusBadge, Text } from '../../../shared/ui';
import { classNames, formatDate } from '../../../shared/utils';

import style from './Dialog.module.css';

/**
 * Отображает карточку диалога.
 *
 * @param {Object} props - Свойства компонента.
 * @param {Object} props.user - Пользователь.
 * @param {boolean} props.isActive - Признак выбранного диалога.
 * @param {Function} props.onSelect - Обработчик выбора диалога.
 * @param {Object} [props.lastMessage] - Последнее сообщение.
 * @returns {JSX.Element} Разметка карточки.
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
        avatar={user.avatarUrl}
        title={user.name}
        subtitle={
          lastMessage ? (
            <Text variant="caption" className={style.lastMessageText}>
              {lastMessage.isOwn ? 'Вы: ' : ''}
              {lastMessage.content}
            </Text>
          ) : (
            <Text variant="caption">Нет сообщений</Text>
          )
        }
      />
      <div className={style.rightColumn}>
        <Text variant="caption" className={style.timeText}>
          {lastMessage && formatDate(lastMessage.createdAt)}
        </Text>
        <StatusBadge status={user.online ? 'online' : 'offline'} size="sm" />
      </div>
    </div>
  );
};
