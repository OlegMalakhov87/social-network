import { useState } from 'react';
import { classNames, formatTime } from '../../../shared/lib';
import {
  Button,
  ButtonGroup,
  ConfirmDialog,
  Text,
  TextArea,
} from '../../../shared/ui';
import { SharedEntityCard, normalizeSharedMessage } from '../../sharedEntity';
import { getMessageActions } from '../lib/getMessageActions';
import style from './Message.module.css';

/** Компонент отображения сообщения.
 * @param {Object} props
 * @param {Object} props.message - сообщение
 * @param {boolean} props.isOwn - является ли сообщение от текущего пользователя
 * @param {Object} props.sharedEntity - объект, содержащий информацию о сущности которой поделился пользователь
 * @param {Function} props.onPlayMedia - функция для воспроизведения медиа-контента
 * @param {Function} props.onDelete - функция для удаления сообщения
 * @param {Function} props.toggleLike - функция для лайка/дизлайка сообщения
 * @param {Function} props.onShare - функция для передачи сообщения
 * @param {Function} props.onUpdate - функция для редактирования сообщения
 * @param {Function} props.onBack - функция для возврата к списку сообщений
 */
export const Message = ({
  message,
  isOwn,
  sharedEntity,
  onPlayMedia,
  toggleLike,
  onUpdate,
  onDelete,
  onBack,
}) => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  if (!message?.id) return null;

  const hasSharedEntity = !!message.sharedEntity;

  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editingMessageId) {
      onUpdate(editingMessageId, editText.trim());
    }
    handleCancelEdit();
  };

  const actions = getMessageActions({
    message,
    isOwn,
    sharedEntity,
    toggleLike,
    handleStartEdit,
    onDelete: () => setShowDeleteDialog(true),
    onShare: () => {
      sessionStorage.setItem(
        'sharedEntity',
        JSON.stringify(normalizeSharedMessage(message))
      );
      onBack();
    },
  });

  const handleConfirmDelete = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  return (
    <div
      className={classNames(
        style.messageWrapper,
        isOwn ? style.own : style.other
      )}
    >
      <div
        className={classNames(style.message, isOwn ? style.own : style.other)}
      >
        {hasSharedEntity ? (
          <SharedEntityCard entity={sharedEntity} onPlayMedia={onPlayMedia} />
        ) : (
          <Text linkifyText={true} className={style.messageContent}>
            {message.text}
          </Text>
        )}

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

          {actions && <div className={style.messageActions}>{actions}</div>}
        </div>
      </div>

      {editingMessageId === message.id && (
        <div id={message.id} className={style.editWrapper}>
          <TextArea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            autoFocus
          />
          <ButtonGroup>
            <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
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
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить сообщение?"
        description="Это действие нельзя отменить. Сообщение будет удалено навсегда."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmVariant="danger"
      />
    </div>
  );
};
