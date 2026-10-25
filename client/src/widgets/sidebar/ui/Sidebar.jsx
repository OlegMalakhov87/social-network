import { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectUser } from '../../../entities/auth';
import {
  BaseCard,
  Button,
  EntityContent,
  EntityMeta,
  IconButton,
  MediaPreview,
  Text,
} from '../../../shared/ui';
import { classNames } from '../../../shared/utils';
import { SIDEBAR_CONFIG } from '..';
import { WeatherWidget } from '../weather';

import style from './Sidebar.module.css';

/**
 * Отображает иконку в формате аватара.
 *
 * @param {Object} props - Свойства компонента
 * @param {string} props.icon - Значок пункта
 * @returns {JSX.Element} Разметка иконки.
 */
const IconAvatar = ({ icon }) => <div className={style.listIcon}>{icon}</div>;

/**
 * Отображает боковую панель приложения.
 *
 * @returns {JSX.Element|null} Разметка панели.
 */
export const Sidebar = () => {
  const currentUser = useSelector(selectUser);
  const [isVisible, setIsVisible] = useState(true);

  const address = currentUser?.address || 'Москва';

  if (!isVisible) return null;

  const { premium, ad, popular, events } = SIDEBAR_CONFIG;

  return (
    <aside className={style.sidebar}>
      <IconButton
        icon="✕"
        variant="ghost"
        size="sm"
        className={style.closeButton}
        onClick={() => setIsVisible(false)}
        ariaLabel="Скрыть панель"
      />

      <BaseCard
        className={classNames(style.sidebarCard, style.card, style.gradientPrimary)}
        header={
          <Text variant="h3" className={style.promoTitle}>
            {premium.title}
          </Text>
        }
        content={
          <Text variant="body2" className={style.promoText}>
            {premium.text}
          </Text>
        }
        actions={
          <Button variant="secondary" size="sm" className={style.promoButton}>
            {premium.buttonText}
          </Button>
        }
      />

      <BaseCard
        className={style.sidebarCard}
        header={<Text variant="h4">{ad.title}</Text>}
        cover={
          <MediaPreview
            src={ad.image}
            alt="Реклама"
            clickable
            onClick={() => window.open(ad.linkUrl, '_blank')}
          />
        }
        content={
          <Text variant="body2" className={style.adDescription}>
            {ad.description}
          </Text>
        }
        actions={
          <a
            href={ad.linkUrl}
            className={style.adLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {ad.linkText}
          </a>
        }
      />

      <BaseCard
        className={style.sidebarCard}
        header={<Text variant="h4">{popular.title}</Text>}
        content={
          <EntityContent className={style.list}>
            {popular.items.map((item, idx) => (
              <EntityMeta
                key={idx}
                avatar={<IconAvatar icon={item.icon} />}
                title={item.title}
                subtitle={item.sub}
                className={style.listItemMeta}
              />
            ))}
          </EntityContent>
        }
      />

      <WeatherWidget address={address} />

      <BaseCard
        className={style.sidebarCard}
        header={<Text variant="h4">{events.title}</Text>}
        content={
          <EntityContent className={style.list}>
            {events.items.map((item, idx) => (
              <EntityMeta
                key={idx}
                avatar={<IconAvatar icon={item.icon} />}
                title={item.title}
                subtitle={item.sub}
                className={style.listItemMeta}
              />
            ))}
          </EntityContent>
        }
      />
    </aside>
  );
};
