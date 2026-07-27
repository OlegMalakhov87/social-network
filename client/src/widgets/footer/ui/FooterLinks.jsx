import { Link } from 'react-router-dom';
import { Text } from '../../../shared/ui';
import style from './FooterLinks.module.css';

/**
 * Универсальный компонент для секций ссылок в футере(ссылки на страницы компании, продукта и других разделов).
 *
 * @param {Object} props
 * @param {string} props.title - заголовок секции
 * @param {Array<{label: string, path: string}>} props.links - массив ссылок
 *
 * @returns {React.ReactNode}
 */
export const FooterLinks = ({ title, links }) => {
  return (
    <div className={style.section}>
      <Text variant="h4" className={style.sectionTitle}>
        {title}
      </Text>
      <ul className={style.links}>
        {links.map((link) => (
          <li key={link.path} className={style.linkItem}>
            <Link to={link.path} className={style.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
