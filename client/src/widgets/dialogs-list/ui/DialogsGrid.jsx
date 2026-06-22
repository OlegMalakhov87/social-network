import style from './DialogsGrid.module.css';
import { DialogCard } from '../../../entities/dialog';
import { EmptyState } from '../../../shared/ui';

/**
 * Сетка списка диалогов.
 * @param {Object} props
 * @param {Array} props.dialogs - массив { user, lastMessage }
 * @param {Function} props.onSelect - колбэк выбора (возвращает функцию)
 * @param {number} props.selectedUserId - ID выбранного пользователя
 * @param {number} props.currentUserId - ID текущего пользователя
 */
export const DialogsGrid = ({ dialogs, onSelect, selectedUserId, currentUserId }) => {
  return (
    <div className={style.dialogs}>
      <ul className={style.dialogsList}>
        {dialogs.length > 0 ? (
          dialogs.map(({ user, lastMessage }) => (
            <DialogCard
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              isActive={selectedUserId === user.id}
              onSelect={onSelect}
              lastMessage={lastMessage}
            />
          ))
        ) : (
          <div className={style.emptyWrapper}>
            <EmptyState
              icon="💬"
              title="Нет диалогов"
              description="Начните общение с друзьями"
              actionLabel="Найти друзей"
            />
          </div>
        )}
      </ul>
    </div>
  );
};
