import { useState } from 'react';
import style from './CommentCard.module.css';
import { ImageWithFallback, formatTime } from '../../../shared/lib';

/**
 * Презентационный компонент одного комментария.
 * @param {Object} props
 * @param {Object} props.comment - данные комментария
 * @param {Object} props.currentUser - текущий пользователь
 * @param {Object} props.author - автор комментария
 * @param {Function} props.onEdit - редактирование (commentId, newText)
 * @param {Function} props.onDelete - удаление (commentId)
 * @param {Function} props.toggleLike - лайк/дизлайк (commentId)
 */
export const CommentCard = ({ comment, currentUser, author, onEdit, onDelete, toggleLike }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment?.content || '');
  const isAuthor = currentUser?.id === comment?.userId;

  if (!comment?.id) return null;

  const handleSave = (e) => {
    e?.stopPropagation();
    if (editText.trim() && currentUser) {
      onEdit?.(comment.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    setEditText(comment.content);
    setIsEditing(false);
  };

  return (
    <div className={style.item}>
      <div className={style.header}>
        <div className={style.author}>
          <div className={style.authorAvatar}>
            <ImageWithFallback src={author.photoUrl} alt="Фото" fallback="/userPhoto.jpg" />
          </div>
          <div className={style.authorInfo}>
            <div className={style.authorName}>
              <a href={`/profile/${comment.userId}`}>
                {author.name}
                {author.isVerified && <span className={style.authorBadge}>✓</span>}
              </a>
            </div>
            <div className={style.date}>{formatTime(comment.date)}</div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div>
          <textarea
            className={style.replyInput}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
          <div className={style.replyActions}>
            <button
              className={`${style.replyButton} ${style.primary}`}
              onClick={handleSave}
              disabled={!editText.trim()}
            >
              Сохранить
            </button>
            <button className={`${style.replyButton} ${style.secondary}`} onClick={handleCancel}>
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className={style.text}>{comment.content}</div>
      )}

      <div className={style.actionsRow}>
        {isAuthor && !isEditing && (
          <div className={style.actions}>
            <button
              className={`${style.action} ${style.edit}`}
              onClick={() => setIsEditing(true)}
              aria-label="Редактировать"
            >
              ✏️ Редактировать
            </button>
            <button
              className={`${style.action} ${style.delete}`}
              onClick={(e) => {
                e?.stopPropagation();
                onDelete?.(comment.id);
              }}
              aria-label="Удалить"
            >
              🗑️ Удалить
            </button>
          </div>
        )}
        <button
          className={`${style.actionButton} ${style.likeButton}`}
          onClick={(e) => {
            e?.stopPropagation();
            comment.isLiked ? toggleLike?.(comment.id, true) : toggleLike?.(comment.id, false);
          }}
          aria-label={comment.isLiked ? 'Убрать лайк' : 'Лайкнуть'}
        >
          {comment.isLiked ? '❤️' : '🤍'}
          <span className={style.buttonText}>{comment.likesCount}</span>
        </button>
      </div>
    </div>
  );
};
