import { useState } from 'react';
import { useDispatch } from 'react-redux';
import style from './ChangePasswordForm.module.css';
import { changePassword, deleteProfile } from '../../../../app/providers/slices/authSlice';

/**
 * Форма смены пароля.
 * @param {Object} props
 * @param {Function} props.showNotification - колбэк для уведомлений
 */
export const ChangePasswordForm = ({ showNotification }) => {
  const dispatch = useDispatch();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification?.('error', 'Пароли не совпадают');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification?.('error', 'Пароль должен быть не менее 6 символов');
      return;
    }
    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification?.('success', 'Пароль успешно изменён');
    } catch (err) {
      showNotification?.('error', err);
    }
  };

  const handleDeleteProfile = async (e) => {
    try {
      e.stopPropagation();
      await dispatch(deleteProfile()).unwrap();
    } catch (err) {
      showNotification?.('error', err);
    }
  };

  return (
    <>
      <h2 className={style.sectionTitle}>Аккаунт</h2>

      <div className={style.form}>
        <h3 style={{ marginBottom: '16px' }}>Смена пароля</h3>

        <div className={style.formGroup}>
          <label className={style.label}>Текущий пароль</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className={style.input}
            placeholder="Введите текущий пароль"
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.label}>Новый пароль</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className={style.input}
            placeholder="Введите новый пароль"
          />
        </div>

        <div className={style.formGroup}>
          <label className={style.label}>Подтвердите пароль</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className={style.input}
            placeholder="Подтвердите новый пароль"
          />
        </div>

        <div className={style.buttons}>
          <button className={`${style.button} ${style.buttonPrimary}`} onClick={handleSubmit}>
            Изменить пароль
          </button>
        </div>

        <h3 style={{ margin: '32px 0 16px' }}>Удаление аккаунта</h3>
        <p style={{ color: '#718096', marginBottom: '16px' }}>
          После удаления аккаунта все ваши данные будут безвозвратно удалены. Это действие нельзя
          отменить.
        </p>
        <button className={`${style.button} ${style.buttonDanger}`} onClick={handleDeleteProfile}>
          Удалить аккаунт
        </button>
      </div>
    </>
  );
};
