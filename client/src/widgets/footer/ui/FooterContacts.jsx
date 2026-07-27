import { CONTACT_INFO } from '..';
import { Text } from '../../../shared/ui';
import style from './FooterContacts.module.css';

/**
 * Секция контактной информации(email, телефон, адрес).
 *
 * @returns {React.ReactNode}
 */
export const FooterContacts = () => {
  return (
    <div className={style.section}>
      <Text variant="h4" className={style.sectionTitle}>
        Контакты
      </Text>
      <ul className={style.contactInfo}>
        {CONTACT_INFO.map((contact, index) => (
          <li key={index} className={style.contactItem}>
            <span className={style.contactIcon} aria-hidden="true">
              {contact.icon}
            </span>
            {contact.href ? (
              <a href={contact.href} className={style.contactLink}>
                {contact.text}
              </a>
            ) : (
              <Text variant="body2">{contact.text}</Text>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
