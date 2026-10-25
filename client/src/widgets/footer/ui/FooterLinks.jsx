import { Link } from 'react-router-dom';

import { Text } from '../../../shared/ui';

import style from './FooterLinks.module.css';

/**
 * Отображает группу ссылок нижней панели.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.title - Заголовок группы
 * @param {Array<{label: string, path: string}>} props.links - Ссылки группы
 * @returns {JSX.Element} Разметка группы.
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
