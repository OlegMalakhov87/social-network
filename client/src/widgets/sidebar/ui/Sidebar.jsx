import { useState } from 'react';
import style from './Sidebar.module.css';

/**
 * Боковая панель (Sidebar) с рекламным блоком, виджетами и погодой.
 * Может скрываться кнопкой закрытия.
 */

export const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={style.info}>
      {/* Кнопка закрытия */}
      <button
        className={style.closeButton}
        onClick={() => setIsVisible(false)}
        title="Скрыть панель"
      >
        ✕
      </button>

      {/* Главный баннер */}
      <div className={style.banner}>
        <div className={style.bannerTitle}>✨ Премиум доступ</div>
        <div className={style.bannerText}>
          Слушайте музыку без рекламы, смотрите видео в 4K и получайте эксклюзивный контент
        </div>
        <button className={style.bannerButton}>Попробовать 30 дней бесплатно</button>
      </div>

      {/* Рекламная карточка */}
      <div className={style.adCard}>
        <div className={style.adImage}>
          <img
            src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300"
            alt="Реклама"
          />
        </div>
        <div className={style.adTitle}>Новая коллекция весна 2026</div>
        <div className={style.adDescription}>Скидка 30% на все товары до конца месяца</div>
        {/* Заменяем ссылку на кнопку для доступности */}
        <button className={style.adLink} onClick={() => {}} aria-label="Перейти в магазин">
          Перейти в магазин →
        </button>
      </div>

      {/* Виджет: Популярное сейчас */}
      <div className={style.widget}>
        <div className={style.widgetTitle}>
          <span>🔥</span> Популярное сейчас
        </div>
        <div className={style.widgetList}>
          <div className={style.widgetItem}>
            <div className={style.widgetIcon}>🎵</div>
            <div className={style.widgetContent}>
              <div className={style.widgetContentTitle}>Bohemian Rhapsody</div>
              <div className={style.widgetContentSub}>Queen • 2.3M прослушиваний</div>
            </div>
          </div>
          <div className={style.widgetItem}>
            <div className={style.widgetIcon}>🎬</div>
            <div className={style.widgetContent}>
              <div className={style.widgetContentTitle}>Интерстеллар</div>
              <div className={style.widgetContentSub}>4.8 ★ • 125K просмотров</div>
            </div>
          </div>
          <div className={style.widgetItem}>
            <div className={style.widgetIcon}>📰</div>
            <div className={style.widgetContent}>
              <div className={style.widgetContentTitle}>SpaceX запуск Starship</div>
              <div className={style.widgetContentSub}>Новости • 1 час назад</div>
            </div>
          </div>
        </div>
      </div>

      {/* Виджет: Погода */}
      <div className={style.weather}>
        <div>
          <div className={style.weatherTemp}>+18°</div>
          <div className={style.weatherCity}>Москва</div>
        </div>
        <div className={style.weatherIcon}>☀️</div>
      </div>

      {/* Виджет: События */}
      <div className={style.widget}>
        <div className={style.widgetTitle}>
          <span>📅</span> Скоро
        </div>
        <div className={style.widgetList}>
          <div className={style.widgetItem}>
            <div className={style.widgetIcon}>🎸</div>
            <div className={style.widgetContent}>
              <div className={style.widgetContentTitle}>Концерт Imagine Dragons</div>
              <div className={style.widgetContentSub}>25 марта • 19:00</div>
            </div>
          </div>
          <div className={style.widgetItem}>
            <div className={style.widgetIcon}>🎮</div>
            <div className={style.widgetContent}>
              <div className={style.widgetContentTitle}>Релиз GTA VI</div>
              <div className={style.widgetContentSub}>Совсем скоро</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
