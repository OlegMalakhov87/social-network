import React, { useState } from 'react';
import style from './VideoForm.module.css';

/**
 * Форма добавления нового видео.
 * @param {Object} props
 * @param {Function} props.onClose - закрыть модальное окно
 * @param {Function} props.onSubmit - колбэк с formData
 */
export const VideoForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: '',
    isPublic: true,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!name) return;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      setError('Заполните обязательные поля: название, ссылка на видео');
      return;
    }
    onSubmit?.(formData);
    onClose();
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2 className={style.modalTitle}>➕ Добавить видео</h2>
          <button className={style.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={style.form}>
          {error && <div className={style.error}>{error}</div>}

          <div className={style.formGroup}>
            <label className={style.label}>Название *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={style.textarea}
              rows={3}
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Ссылка на видео *</label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Ссылка на превью (thumb)</label>
            <input
              type="url"
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              className={style.input}
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Категория</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={style.select}
            >
              <option value="">Выберите категорию</option>
              <option value="Music">Музыка</option>
              <option value="Movie">Кино</option>
              <option value="Sports">Спорт</option>
              <option value="Travel">Путешествия</option>
              <option value="Openings">Открытия</option>
            </select>
          </div>

          <div className={`${style.formGroup} ${style.checkboxGroup}`}>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className={style.checkbox}
              id="videoPublic"
            />
            <label htmlFor="videoPublic" className={style.label}>
              Публичное видео
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
              Добавить видео
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
