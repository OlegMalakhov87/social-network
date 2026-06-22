import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import style from './Footer.module.css';

/**
 * Футер приложения с навигацией, контактами и кнопкой "наверх".
 * @returns {React.ReactElement}
 */
export const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className={style.content}>
          {/* Бренд и описание */}
          <div className={style.brand}>
            <div className={style.logo}>
              <img
                src="/revivo-50.png"
                alt="Logo"
                className={style.logoImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className={style.logoText}>SocialNetwork</span>
            </div>
            <p className={style.description}>
              Современная социальная сеть для общения, обмена музыкой, видео и новостями.
              Присоединяйтесь к нашему сообществу!
            </p>
            <div className={style.socialLinks}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={style.socialLink}
              >
                𝕏
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className={style.socialLink}
              >
                GitHub
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className={style.socialLink}
              >
                Telegram
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className={style.socialLink}
              >
                YouTube
              </a>
            </div>
          </div>

          {/* Компания */}
          <div className={style.section}>
            <h3 className={style.sectionTitle}>Компания</h3>
            <ul className={style.links}>
              <li className={style.linkItem}>
                <Link to="/about" className={style.link}>
                  О нас
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/team" className={style.link}>
                  Команда
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/blog" className={style.link}>
                  Блог
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/press" className={style.link}>
                  Пресса
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/careers" className={style.link}>
                  Карьера
                </Link>
              </li>
            </ul>
          </div>

          {/* Продукт */}
          <div className={style.section}>
            <h3 className={style.sectionTitle}>Продукт</h3>
            <ul className={style.links}>
              <li className={style.linkItem}>
                <Link to="/features" className={style.link}>
                  Возможности
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/security" className={style.link}>
                  Безопасность
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/pricing" className={style.link}>
                  Тарифы
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/updates" className={style.link}>
                  Обновления
                </Link>
              </li>
              <li className={style.linkItem}>
                <Link to="/roadmap" className={style.link}>
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className={style.section}>
            <h3 className={style.sectionTitle}>Контакты</h3>
            <ul className={style.contactInfo}>
              <li className={style.contactItem}>
                <span className={style.contactIcon}>📍</span>
                <span className={style.contactText}>г. Смоленск, пр-т Строителей, 1/42</span>
              </li>
              <li className={style.contactItem}>
                <span className={style.contactIcon}>📧</span>
                <span className={style.contactText}>
                  <a href="mailto:malahov.1987@mail.ru">support@socialnetwork.ru</a>
                </span>
              </li>
              <li className={style.contactItem}>
                <span className={style.contactIcon}>📞</span>
                <span className={style.contactText}>
                  <a href="tel:+79156548842">+7 (915) 654-88-42</a>
                </span>
              </li>
              <li className={style.contactItem}>
                <span className={style.contactIcon}>⏰</span>
                <span className={style.contactText}>Пн-Пт: 08:00 - 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className={style.bottom}>
          <div className={style.copyright}>
            © {currentYear} Oleg Malakhov prod. SocialNetwork. Все права защищены.
          </div>
          <div className={style.legalLinks}>
            <Link to="/privacy" className={style.legalLink}>
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className={style.legalLink}>
              Условия использования
            </Link>
            <Link to="/cookies" className={style.legalLink}>
              Cookies
            </Link>
          </div>
        </div>
      </div>

      {/* Кнопка "Наверх" */}
      <button
        className={`${style.scrollTop} ${showScrollTop ? style.visible : ''}`}
        onClick={scrollToTop}
        aria-label="Наверх"
      >
        ↑
      </button>
    </footer>
  );
};
