import { Link } from 'react-router-dom';
import { Image, Text } from '../../../shared/ui';
import { SOCIAL_LINKS } from '../config/footerConfig';
import style from './FooterBrand.module.css';

/**
 * Бренд компании в футере(логотип и описание компании, ссылки на социальные сети).
 *
 * @returns {React.ReactNode}
 */
export const FooterBrand = () => (
  <div className={style.brand}>
    <div className={style.logo}>
      <Link to="/profile" aria-label="На главную">
        <Image
          src="/revivo-50.png"
          alt="Revivo Logo"
          fallback="/revivo-50.png"
          className={style.logoImage}
        />
      </Link>
      <Text variant="h3" className={style.logoText}>
        SocialNetwork
      </Text>
    </div>
    <Text variant="body2" className={style.description}>
      Современная социальная сеть для общения, обмена музыкой, видео и
      новостями. Присоединяйтесь!
    </Text>
    <div className={style.socialLinks}>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={style.socialLink}
          aria-label={social.label}
        >
          {social.icon}
        </a>
      ))}
    </div>
  </div>
);
