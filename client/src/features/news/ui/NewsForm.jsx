import { useState } from 'react';
import style from './NewsForm.module.css';

/**
 * Форма добавления новости.
 * @param {Object} props
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit
 */
export const NewsForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    author: '',
    source: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.category ||
      !formData.author.trim()
    ) {
      setError('Заполните обязательные поля: заголовок, текст, категорию и автора');
      return;
    }
    onSubmit?.(formData);
    onClose();
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2 className={style.modalTitle}>📰 Добавить новость</h2>
          <button className={style.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={style.form}>
          {error && <div className={style.error}>{error}</div>}

          <div className={style.formGroup}>
            <label className={style.label}>Заголовок *</label>
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
            <label className={style.label}>Текст новости *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className={style.textarea}
              rows={5}
              required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Категория *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={style.select}
              required
            >
              <option value="">Выберите категорию</option>
              <option value="Technology">Технологии</option>
              <option value="Sports">Спорт</option>
              <option value="Culture">Культура</option>
              <option value="Economy">Экономика</option>
              <option value="Health">Здоровье</option>
            </select>
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Автор *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={style.input}
              required
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Источник</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className={style.input}
              placeholder="Название издания"
            />
          </div>

          <div className={style.formGroup}>
            <label className={style.label}>Ссылка на изображение</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className={style.input}
            />
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
              Опубликовать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
