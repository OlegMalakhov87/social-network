import { useState } from 'react';
import style from './NotificationToggle.module.css';

export const NotificationToggle = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    messageSound: true,
    friendRequests: true,
    newPosts: false,
    newsDigest: true,
  });

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <h2 className={style.sectionTitle}>Уведомления</h2>

      <div className={style.toggleGroup}>
        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Email уведомления</div>
            <div className={style.toggleDescription}>Получать уведомления на email</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.emailNotifications ? style.active : ''}`}
            onClick={() => handleNotificationToggle('emailNotifications')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>

        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Push уведомления</div>
            <div className={style.toggleDescription}>Получать push-уведомления в браузере</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.pushNotifications ? style.active : ''}`}
            onClick={() => handleNotificationToggle('pushNotifications')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>

        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Звук сообщений</div>
            <div className={style.toggleDescription}>Воспроизводить звук при новых сообщениях</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.messageSound ? style.active : ''}`}
            onClick={() => handleNotificationToggle('messageSound')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>

        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Запросы в друзья</div>
            <div className={style.toggleDescription}>Уведомлять о новых запросах в друзья</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.friendRequests ? style.active : ''}`}
            onClick={() => handleNotificationToggle('friendRequests')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>

        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Новые посты</div>
            <div className={style.toggleDescription}>Уведомлять о новых постах друзей</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.newPosts ? style.active : ''}`}
            onClick={() => handleNotificationToggle('newPosts')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>

        <div className={style.toggleItem}>
          <div className={style.toggleInfo}>
            <div className={style.toggleTitle}>Дайджест новостей</div>
            <div className={style.toggleDescription}>Получать еженедельный дайджест новостей</div>
          </div>
          <div
            className={`${style.toggle} ${notifications.newsDigest ? style.active : ''}`}
            onClick={() => handleNotificationToggle('newsDigest')}
          >
            <span className={style.toggleKnob} />
          </div>
        </div>
      </div>

      <div className={style.buttons}>
        <button className={`${style.button} ${style.buttonPrimary}`}>Сохранить настройки</button>
      </div>
    </>
  );
};
