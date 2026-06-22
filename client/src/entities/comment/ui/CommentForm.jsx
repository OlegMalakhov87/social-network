import React, { useState, useRef, useEffect } from 'react';
import style from './CommentForm.module.css';
import { ImageWithFallback } from '../../../shared/lib/index';

/**
 * Форма добавления комментария.
 * @param {Object} props
 * @param {Object} props.currentUser - текущий пользователь
 * @param {boolean} props.isLoading - флаг загрузки
 * @param {Function} props.onSubmit - отправка формы
 * @param {number} [props.commentsCount] - общее количество комментариев
 * @param {Function} [props.onCancel] - колбэк отмены (закрытия формы)
 */
export const CommentForm = ({ currentUser, isLoading, onSubmit, commentsCount, onCancel }) => {
  const textareaRef = useRef(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    textareaRef.current?.focus();
  }, []); // фокус при монтировании

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && currentUser) onSubmit?.(content);
    setContent('');
  };

  if (!currentUser) return null;

  return (
    <>
      <h3 className={style.title}>
        <span className={style.titleIcon}>💬</span> Комментарии
        <span className={style.titleCount}>{commentsCount}</span>
      </h3>

      <form className={style.form} onSubmit={handleSubmit}>
        <div className={style.formHeader}>
          <div className={style.avatar}>
            <ImageWithFallback src={currentUser.photoUrl} alt="Фото" fallback="/userPhoto.jpg" />
          </div>
          <div className={style.userInfo}>
            <div className={style.userName}>{currentUser.name}</div>
            <div className={style.userAction}>Напишите комментарий</div>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className={style.textarea}
          placeholder="Что вы думаете по этому поводу?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          rows={1}
        />
        <div className={style.formFooter}>
          {onCancel && (
            <button
              type="button"
              className={`${style.button} ${style.buttonSecondary}`}
              onClick={(e) => {
                e?.stopPropagation();
                onCancel?.();
              }}
            >
              Выйти
            </button>
          )}
          <button
            type="submit"
            className={`${style.button} ${style.buttonPrimary}`}
            disabled={!content?.trim() || isLoading}
          >
            {isLoading ? 'Отправка...' : 'Добавить'}
          </button>
        </div>
      </form>
    </>
  );
};
