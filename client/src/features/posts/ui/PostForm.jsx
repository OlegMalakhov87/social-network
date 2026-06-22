import React, { useState, useRef, useEffect } from 'react';
import style from './PostForm.module.css';

const POST_TYPES = [
  { value: 'text', label: 'Текст', icon: '📝' },
  { value: 'image', label: 'Изображение', icon: '🖼️' },
  { value: 'video', label: 'Видео', icon: '🎬' },
];

/**
 * Форма создания/редактирования поста.
 * @param {Object} props
 * @param {Object} props.currentUser – текущий пользователь
 * @param {boolean} props.isLoading – флаг загрузки
 * @param {Function} props.onAddPost – колбэк с данными поста
 * @param {Function} props.onClose – закрыть форму
 */
export const PostForm = ({ currentUser, isLoading, onAddPost, onClose, errorPosts }) => {
  const textareaRef = useRef(null);
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [postType, setPostType] = useState('text');
  const [mediaUrl, setMediaUrl] = useState('');
  const [error, setError] = useState('');

  /** Проверка, является ли строка валидным URL */
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.stopPropagation();
    setError('');
    if (!message.trim()) return;

    if (postType !== 'text') {
      if (!mediaUrl.trim()) {
        setError('Введите URL');
        return;
      }
      if (!isValidUrl(mediaUrl.trim())) {
        setError('Некорректный URL');
        return;
      }
    }

    const payload = {
      message: message.trim(),
      visibility,
      postType,
    };

    if (postType !== 'text') {
      payload.mediaUrl = mediaUrl.trim() || '';
    }
    onAddPost?.(payload);
    setMessage('');
    setMediaUrl('');
    setPostType('text');
    setVisibility('public');
    onClose?.();
  };

  /**  При смене типа сбрасываем ошибку и URL */
  const handleTypeChange = (newType) => {
    setPostType(newType);
    setError('');
    setMediaUrl('');
  };

  if (!currentUser) return null;

  return (
    <div className={style.postForm}>
      {/* Выбор типа поста */}
      <div className={style.typeSelector}>
        {POST_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            className={`${style.typeButton} ${postType === type.value ? style.typeButtonActive : ''}`}
            onClick={() => handleTypeChange(type.value)}
            title={type.label}
          >
            <span className={style.typeIcon}>{type.icon}</span>
            <span className={style.typeLabel}>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Поле ввода сообщения */}
      <textarea
        ref={textareaRef}
        className={style.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Поделитесь своими новостями"
        rows={3}
        disabled={isLoading}
      />

      {/* Динамическое поле для URL */}
      {postType !== 'text' && (
        <input
          type="url"
          className={style.mediaUrlInput}
          placeholder={postType === 'image' ? 'Ссылка на изображение...' : 'Ссылка на видео...'}
          value={mediaUrl}
          onChange={(e) => {
            setMediaUrl(e.target.value);
            setError('');
          }}
          required
          disabled={isLoading}
        />
      )}

      {/* Сообщение об ошибке */}
      {error && <div className={style.errorMessage}>{error}</div>}

      {/* Выбор приватности */}
      <div className={style.formGroup}>
        <label className={style.label}>Видимость</label>
        <select
          className={style.visibilitySelect}
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          disabled={isLoading}
        >
          <option value="public">Публичный (все)</option>
          <option value="friends">Только друзья</option>
          <option value="private">Только я</option>
        </select>
      </div>

      {/* Кнопки действий */}
      <div className={style.buttonGroup}>
        <button
          type="button"
          className={`${style.button} ${style.buttonSecondary}`}
          onClick={(e) => {
            e.preventDefault();
            onClose?.();
          }}
          disabled={isLoading}
        >
          ✕ Отмена
        </button>
        <button
          type="button"
          className={style.button}
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
        >
          ✏️ Опубликовать
        </button>
      </div>
    </div>
  );
};
