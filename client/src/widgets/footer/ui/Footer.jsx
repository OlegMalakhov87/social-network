import { Link } from 'react-router-dom';
import {
  COMPANY_LINKS,
  FooterBrand,
  FooterContacts,
  FooterLinks,
  LEGAL_LINKS,
  PRODUCT_LINKS,
  ScrollToTopButton,
} from '..';
import { Text } from '../../../shared/ui';
import style from './Footer.module.css';

/**
 * Футер приложения с навигацией, контактами и кнопкой "наверх".
 * Композиция подкомпонентов для читабельности и переиспользования.
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={style.footer}>
      <div className={style.container}>
        <div className={style.content}>
          <FooterBrand />
          <FooterLinks title="Компания" links={COMPANY_LINKS} />
          <FooterLinks title="Продукт" links={PRODUCT_LINKS} />
          <FooterContacts />
        </div>

        <div className={style.bottom}>
          <Text variant="caption" className={style.copyright}>
            © {currentYear} Oleg Malakhov prod. SocialNetwork. Все права
            защищены.
          </Text>
          <div className={style.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={style.legalLink}>
              {link.label}
            </Link>
            ))}
          </div>
        </div>
      </div>

      <ScrollToTopButton />
    </footer>
  );
};
