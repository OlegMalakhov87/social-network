import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from '..';
import { Image, Text } from '../../../shared/ui';
import style from './FooterBrand.module.css';

/**
 * Секция бренда: логотип, описание и социальные сети.
 */
export const FooterBrand = () => {
  return (
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
        новостями. Присоединяйтесь к нашему сообществу!
      </Text>

      <div className={style.socialLinks}>
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.label}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={style.socialLink}
            aria-label={`Перейти в ${social.label}`}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  );
};
