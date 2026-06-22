import React, { useState } from 'react';
import style from './TrackForm.module.css';

/**
 * Форма добавления нового трека.
 * @param {Object} props
 * @param {Function} props.onClose - закрыть модальное окно
 * @param {Function} props.onSubmit - колбэк с formData
 */
export const TrackForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    year: '',
    duration: '',
    fileUrl: '',
    genre: '',
    description: '',
    isPublic: true,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.artist.trim() || !formData.fileUrl.trim()) {
      setError('Заполните обязательные поля: название, исполнитель, ссылка на файл');
      return;
    }
    onSubmit?.(formData);
    onClose();
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2 className={style.modalTitle}>🎵 Добавить трек</h2>
          <button className={style.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={style.form}>
          {error && <div className={style.error}>{error}</div>}
          <div className={style.formGroup}>
            <label className={style.label}>Название *</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Исполнитель *</label>
            <input
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Альбом</label>
            <input
              name="album"
              value={formData.album}
              onChange={handleChange}
              className={style.input}
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Ссылка на файл *</label>
            <input
              name="fileUrl"
              type="url"
              value={formData.fileUrl}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Жанр</label>
            <input
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              className={style.input}
              placeholder="Rock, Pop, Jazz..."
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={style.textarea}
              rows={2}
            />
          </div>
          <div className={`${style.formGroup} ${style.checkboxGroup}`}>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className={style.checkbox}
              id="musicPublic"
            />
            <label htmlFor="musicPublic" className={style.label}>
              Публичный трек
            </label>
          </div>
          <div className={style.actions}>
            <button
              type="button"
              className={`${style.button} ${style.buttonSecondary}`}
              onClick={onClose}
            >
              Отмена
            </button>
            <button type="submit" className={`${style.button} ${style.buttonPrimary}`}>
              Добавить трек
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
