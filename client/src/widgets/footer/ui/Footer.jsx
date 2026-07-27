import { Link } from 'react-router-dom';
import { EntityHeader, Text } from '../../../shared/ui';
import {
  COMPANY_LINKS,
  LEGAL_LINKS,
  PRODUCT_LINKS,
} from '../config/footerConfig';
import style from './Footer.module.css';
import { FooterBrand } from './FooterBrand';
import { FooterContacts } from './FooterContacts';
import { FooterLinks } from './FooterLinks';
import { ScrollToTopButton } from './ScrollToTopButton';

/**
 * Футер сайта с информацией о компании, продукте, контактах и ссылках на legals
 * показывает информацию о компании, продукте, контактах и ссылках на legals
 *
 *
 * @returns {React.ReactNode}
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

        <EntityHeader className={style.bottom}>
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
        </EntityHeader>
      </div>
      <ScrollToTopButton />
    </footer>
  );
};
