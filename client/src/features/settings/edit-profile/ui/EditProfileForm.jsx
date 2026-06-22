import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './EditProfileForm.module.css';
import { ImageWithFallback } from '../../../../shared/lib';
import { Loading } from '../../../../shared/ui';
import { updateProfile } from '../../../../app/providers/slices/authSlice';

/**
 * Форма редактирования профиля.
 * @param {Object} props
 * @param {Function} props.showNotification - колбэк для уведомлений
 */
export const EditProfileForm = ({ showNotification }) => {
  const currentUser = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: currentUser?.nickname ?? '',
    name: currentUser?.name ?? '',
    age: currentUser?.age ?? '',
    email: currentUser?.email ?? '',
    address: currentUser?.address ?? '',
    job: currentUser?.job ?? '',
    status: currentUser?.status ?? '',
    phone: currentUser?.phone ?? '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    try {
      e.stopPropagation();
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
      showNotification?.('success', 'Профиль успешно обновлён');
    } catch (err) {
      showNotification?.('error', err);
    }
  };

  const handleReset = () => {
    setFormData({
      nickname: currentUser?.nickname ?? '',
      name: currentUser?.name ?? '',
      age: currentUser?.age ?? '',
      email: currentUser?.email ?? '',
      address: currentUser?.address ?? '',
      job: currentUser?.job ?? '',
      status: currentUser?.status ?? '',
      phone: currentUser?.phone ?? '',
    });
    setIsEditing(false);
  };

  if (!currentUser) return <Loading message="Загрузка ... " />;

  return (
    <>
      <h2 className={style.sectionTitle}>Профиль пользователя</h2>

      <div className={style.avatarSection}>
        <div className={style.avatar}>
          <ImageWithFallback src={currentUser.photoUrl} alt="Ваше фото" fallback="/support.png" />
          <div className={style.avatarOverlay}>📷</div>
        </div>
        <div className={style.avatarInfo}>
          <div className={style.avatarName}>{formData.name || 'Ваше имя'}</div>
          <div className={style.avatarEmail}>{formData.email}</div>
          <button className={style.avatarButton}>Изменить фото</button>
        </div>
      </div>

      <div className={style.form}>
        <div className={style.row}>
          <div className={style.formGroup}>
            <label className={style.label}>Имя</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={style.input}
              placeholder="Введите ваше имя"
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Никнейм</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleInputChange}
              className={style.input}
              placeholder="@username"
            />
          </div>
        </div>

        <div className={style.row}>
          <div className={style.formGroup}>
            <label className={style.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={style.input}
              placeholder="email@example.com"
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={style.input}
              placeholder="+7 (999) 999-99-99"
            />
          </div>
        </div>

        <div className={style.row}>
          <div className={style.formGroup}>
            <label className={style.label}>Город</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={style.input}
              placeholder="Ваш адрес"
            />
          </div>
          <div className={style.formGroup}>
            <label className={style.label}>Возраст</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className={style.input}
              min="9"
              max="99"
            />
          </div>
        </div>

        <div className={style.formGroup}>
          <label className={style.label}>Работа</label>
          <input
            type="text"
            name="job"
            value={formData.job}
            onChange={handleInputChange}
            className={style.input}
            placeholder="Место работы или должность"
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.label}>Статус</label>
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={style.input}
            placeholder="Ваш текущий статус"
          />
        </div>

        <div className={style.buttons}>
          <button
            className={`${style.button} ${style.buttonPrimary}`}
            onClick={handleSaveProfile}
            disabled={!isEditing}
          >
            Сохранить изменения
          </button>
          <button
            className={`${style.button} ${style.buttonSecondary}`}
            onClick={handleReset}
            disabled={!isEditing}
          >
            Отменить
          </button>
        </div>
      </div>
    </>
  );
};
