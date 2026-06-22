import { useState } from 'react';
import styles from './PrivacySettings.module.css';

export const PrivacySettings = () => {
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'all',
    postsVisibility: 'friends',
    tracksVisibility: 'private',
    videosVisibility: 'private',
  });

  const handlePrivacyChange = (key, value) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <h2 className={styles.sectionTitle}>Приватность</h2>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Кто видит мой профиль</label>
          <select
            className={styles.select}
            value={privacy.profileVisibility}
            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
          >
            <option value="all">Все пользователи</option>
            <option value="friends">Только друзья</option>
            <option value="friends_of_friends">Друзья и друзья друзей</option>
            <option value="private">Только я</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Кто видит мои посты</label>
          <select
            className={styles.select}
            value={privacy.postsVisibility}
            onChange={(e) => handlePrivacyChange('postsVisibility', e.target.value)}
          >
            <option value="public">Все пользователи</option>
            <option value="friends">Только друзья</option>
            <option value="private">Только я</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Кто видит мои треки</label>
          <select
            className={styles.select}
            value={privacy.tracksVisibility}
            onChange={(e) => handlePrivacyChange('tracksVisibility', e.target.value)}
          >
            <option value="all">Все пользователи</option>
            <option value="friends">Только друзья</option>
            <option value="private">Никто</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Кто видит мои видео</label>
          <select
            className={styles.select}
            value={privacy.videosVisibility}
            onChange={(e) => handlePrivacyChange('videosVisibility', e.target.value)}
          >
            <option value="all">Все пользователи</option>
            <option value="friends">Только друзья</option>
            <option value="private">Только я</option>
          </select>
        </div>

        <div className={styles.buttons}>
          <button className={`${styles.button} ${styles.buttonPrimary}`}>
            Сохранить настройки
          </button>
        </div>
      </div>
    </>
  );
};
