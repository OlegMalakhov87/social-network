import { useState } from 'react';
import { getMessageActions } from '..';
import { classNames, formatTime } from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  ConfirmDialog,
  EntityActions,
  Text,
  TextArea,
} from '../../../shared/ui';
import { SharedEntityCard } from '../../sharedEntity';
import style from './Message.module.css';

/** Компонент отображения сообщения.
 * @param {Object} props
 * @param {Object} props.message - сообщение
 * @param {boolean} props.isOwn - является ли сообщение от текущего пользователя
 * @param {Function} props.onShareEntity - функция для передачи сообщения
 * @param {Object} props.sharedEntity - объект, содержащий информацию о сущности которой поделился пользователь
 * @param {Function} props.onPlayMedia - функция для воспроизведения медиа-контента
 * @param {Function} props.onDelete - функция для удаления сообщения
 * @param {Function} props.toggleLike - функция для лайка/дизлайка сообщения
 * @param {Function} props.onShare - функция для передачи сообщения
 * @param {Function} props.onUpdate - функция для редактирования сообщения
 */
export const Message = ({
  message,
  isOwn,
  onShareEntity,
  sharedEntity,
  onPlayMedia,
  toggleLike,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!message?.id) return null;

  /** Начало редактирования сообщения.*/
  const handleStartEdit = (msg) => {
    setIsEditing(true);
    setEditText(msg.text);
  };

  /** Отмена редактирования сообщения.*/
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  /** Сохранение редактирования сообщения.*/
  const handleSaveEdit = () => {
    if (editText.trim() && isEditing) {
      onUpdate(message.id, editText.trim());
    }
    handleCancelEdit();
  };

  /** Действия для сообщения.*/
  const actions = getMessageActions({
    message,
    isOwn,
    sharedEntity,
    toggleLike,
    handleStartEdit,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => onShareEntity(message),
  });

  /** Подтверждение удаления сообщения.*/
  const handleConfirmDelete = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        className={classNames(
          style.messageWrapper,
          isOwn ? style.own : style.other
        )}
      >
        <div
          className={classNames(style.message, isOwn ? style.own : style.other)}
        >
          {isEditing ? (
            <div className={style.editMode}>
              <TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                autoFocus
                className={style.editInput}
              />
              <ButtonGroup align="end" className={style.editActions}>
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editText.trim()}
                >
                  Сохранить
                </Button>
              </ButtonGroup>
            </div>
          ) : sharedEntity ? (
            <SharedEntityCard entity={sharedEntity} onPlayMedia={onPlayMedia} />
          ) : (
            <Text linkifyText={true} className={style.messageContent}>
              {message.text}
            </Text>
          )}

          {!isEditing && (
            <div className={style.messageFooter}>
              <span className={style.messageTime}>
                {message.isEdited && (
                  <span className={style.editedLabel}>изм. </span>
                )}
                {formatTime(message.updateDate || message.createDate)}
              </span>

              {isOwn && (
                <span className={style.messageStatus}>
                  {message.isRead ? '✓✓' : '✓'}
                </span>
              )}

              {actions.length > 0 && (
                <div className={style.messageActions}>
                  <EntityActions actions={actions} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить сообщение?"
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </>
  );
};
