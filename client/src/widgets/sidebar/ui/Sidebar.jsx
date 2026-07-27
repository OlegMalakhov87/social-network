import { useState } from 'react';
import { SIDEBAR_CONFIG } from '..';
import { classNames } from '../../../shared/lib';
import {
  BaseCard,
  Button,
  EntityContent,
  EntityMeta,
  IconButton,
  MediaPreview,
  Text,
} from '../../../shared/ui';
import style from './Sidebar.module.css';

// Компактная обертка для иконки, чтобы она выглядела как аватар в EntityMeta
const IconAvatar = ({ icon }) => <div className={style.listIcon}>{icon}</div>;

/**
 * Основная информационно-рекламная панель (боковая панель справа от пользователя)
 *
 * @returns {React.ReactNode}
 */
export const Sidebar = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  const { premium, ad, weather, popular, events } = SIDEBAR_CONFIG;

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

      {/* 1. Премиум */}
      <BaseCard
        className={classNames(style.card, style.gradientPrimary)}
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

      {/* 2. Реклама */}
      <BaseCard
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

      {/* 3. Популярное */}
      <BaseCard
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

      {/* 4. Погода */}
      <BaseCard className={classNames(style.card, style.gradientBlue)}>
        <div className={style.weatherContent}>
          <div>
            <Text variant="h1" className={style.weatherTemp}>
              {weather.temp}
            </Text>
            <Text variant="body2">{weather.city}</Text>
          </div>
          <span className={style.weatherIcon}>{weather.icon}</span>
        </div>
      </BaseCard>

      {/* 5. События */}
      <BaseCard
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
